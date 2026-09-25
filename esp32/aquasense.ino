/*
 * AquaSense ESP32 Firmware
 * Smart Water Quality Monitoring System
 *
 * Sensors:
 *   - pH Sensor       → GPIO 34 (ADC)
 *   - TDS Sensor      → GPIO 35 (ADC)
 *   - Turbidity       → GPIO 32 (ADC)
 *   - DS18B20 Temp    → GPIO 4 (OneWire)
 *
 * Posts JSON to AquaSense API every 30 seconds.
 *
 * Libraries required:
 *   - WiFi.h (built-in)
 *   - HTTPClient.h (built-in)
 *   - ArduinoJson (install via Library Manager)
 *   - OneWire + DallasTemperature (for DS18B20)
 *
 * Deployment Instructions:
 * 1. Open this file in Arduino IDE.
 * 2. Install the required libraries using Sketch > Include Library > Manage Libraries.
 * 3. Update WIFI_SSID, WIFI_PASSWORD, and API_ENDPOINT to match your network.
 * 4. Connect ESP32 via USB and select the correct COM port.
 * 5. Click "Upload" to flash the firmware to the device.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ─── Configuration ───────────────────────────────────────
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* API_ENDPOINT  = "http://192.168.1.100:8000/api/readings";
const char* DEVICE_ID     = "esp32-001";
const char* LOCATION      = "Main Tank";
const int   READ_INTERVAL = 30000;  // 30 seconds

// ─── Pin Definitions ─────────────────────────────────────
#define PH_PIN         34
#define TDS_PIN        35
#define TURBIDITY_PIN  32
#define TEMP_PIN       4

// ─── Calibration Constants ───────────────────────────────
// pH: ADC reading mapped to 0–14 scale
// Calibrate these values with buffer solutions (pH 4.0, pH 7.0)
const float PH_OFFSET   = 0.0;
const float PH_SLOPE    = 1.0;
const float VREF        = 3.3;
const float ADC_MAX     = 4095.0;

// TDS calibration
const float TDS_FACTOR  = 0.5;    // Adjust based on probe

// ─── Globals ─────────────────────────────────────────────
unsigned long lastReadTime = 0;
int   wifiRetries = 0;

// ─── Helper: Read ADC with averaging ─────────────────────
float readADC(int pin, int samples = 10) {
  float sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  return sum / samples;
}

// ─── Sensor Readings ─────────────────────────────────────
float readPH() {
  float raw = readADC(PH_PIN);
  float voltage = (raw / ADC_MAX) * VREF;
  // Linear mapping: voltage 0V=pH14, 3.3V=pH0 (adjust per your probe)
  float ph = 7.0 + ((2.5 - voltage) / 0.18) * PH_SLOPE + PH_OFFSET;
  return constrain(ph, 0.0, 14.0);
}

float readTDS() {
  float raw = readADC(TDS_PIN);
  float voltage = (raw / ADC_MAX) * VREF;
  // TDS formula (temperature compensated at 25°C)
  float tds = (133.42 * voltage * voltage * voltage
             - 255.86 * voltage * voltage
             + 857.39 * voltage) * TDS_FACTOR;
  return constrain(tds, 0.0, 2000.0);
}

float readTurbidity() {
  float raw = readADC(TURBIDITY_PIN);
  float voltage = (raw / ADC_MAX) * VREF;
  // Turbidity: higher voltage = cleaner water (inverted)
  float ntu = -1120.4 * voltage * voltage + 5742.3 * voltage - 4352.9;
  return constrain(ntu, 0.0, 3000.0);
}

float readTemperature() {
  // NOTE: For real deployment, use DS18B20 via OneWire + DallasTemperature
  // This simulates a reading for demonstration purposes
  // Replace with: sensors.requestTemperatures(); return sensors.getTempCByIndex(0);
  float raw = readADC(TEMP_PIN);
  float voltage = (raw / ADC_MAX) * VREF;
  float temp = (voltage - 0.5) * 100.0;  // LM35 formula
  return constrain(temp, -10.0, 100.0);
}

// ─── WiFi Connection ─────────────────────────────────────
void connectWiFi() {
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi connection failed. Retrying in 10s...");
  }
}

// ─── POST to AquaSense API ────────────────────────────────
bool postReading(float ph, float tds, float turbidity, float temperature) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi not connected, skipping POST");
    return false;
  }

  HTTPClient http;
  http.begin(API_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["device_id"]   = DEVICE_ID;
  doc["ph"]          = round(ph * 100.0) / 100.0;
  doc["tds"]         = round(tds * 10.0) / 10.0;
  doc["turbidity"]   = round(turbidity * 100.0) / 100.0;
  doc["temperature"] = round(temperature * 10.0) / 10.0;
  doc["location"]    = LOCATION;

  String payload;
  serializeJson(doc, payload);

  Serial.println("📤 Sending payload:");
  Serial.println(payload);

  int httpCode = http.POST(payload);
  String response = http.getString();
  http.end();

  if (httpCode == 200 || httpCode == 201) {
    Serial.println("✅ Data sent successfully!");
    Serial.println("   Response: " + response);
    return true;
  } else {
    Serial.print("❌ HTTP Error: ");
    Serial.println(httpCode);
    Serial.println("   Response: " + response);
    return false;
  }
}

// ─── Setup ───────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("╔════════════════════════════╗");
  Serial.println("║   🌊 AquaSense ESP32       ║");
  Serial.println("║   Water Quality Monitor    ║");
  Serial.println("╚════════════════════════════╝");

  analogReadResolution(12);  // 12-bit ADC (0–4095)
  analogSetAttenuation(ADC_11db);  // Full 3.3V range

  connectWiFi();
  lastReadTime = millis() - READ_INTERVAL;  // Read immediately on boot
}

// ─── Loop ────────────────────────────────────────────────
void loop() {
  // Reconnect WiFi if needed
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("🔄 WiFi disconnected, reconnecting...");
    connectWiFi();
  }

  unsigned long now = millis();
  if (now - lastReadTime >= READ_INTERVAL) {
    lastReadTime = now;

    Serial.println("\n─────── New Reading ───────");

    float ph          = readPH();
    float tds         = readTDS();
    float turbidity   = readTurbidity();
    float temperature = readTemperature();

    Serial.printf("   pH:          %.2f\n", ph);
    Serial.printf("   TDS:         %.1f mg/L\n", tds);
    Serial.printf("   Turbidity:   %.2f NTU\n", turbidity);
    Serial.printf("   Temperature: %.1f °C\n", temperature);

    postReading(ph, tds, turbidity, temperature);
  }

  delay(100);
}
