# AquaSense - Software Test Script (PowerShell)
# Hardware ke bina fake ESP32 data bhejo backend ko
# Usage: PowerShell mein run karo: .\test_sensor.ps1

$API = "http://localhost:8000"
$EMAIL = "admin@aquasense.io"
$PASSWORD = "admin123"

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  AquaSense - Software Test Script" -ForegroundColor Cyan
Write-Host "  Water Salinity & Quality Monitor" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Register (ignore error if already exists)
Write-Host "[1/4] Registering user..." -ForegroundColor Yellow
try {
    $regBody = @{ name = "Test Admin"; email = $EMAIL; password = $PASSWORD } | ConvertTo-Json
    Invoke-RestMethod -Uri "$API/api/auth/register" -Method POST -Body $regBody -ContentType "application/json" -ErrorAction SilentlyContinue | Out-Null
} catch {}

# Step 2: Login and get token
Write-Host "[2/4] Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{ email = $EMAIL; password = $PASSWORD } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "$API/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginRes.access_token
    Write-Host "      Login successful! Token received." -ForegroundColor Green
} catch {
    Write-Host "      ERROR: Could not login. Is backend running at $API ?" -ForegroundColor Red
    Write-Host "      Run: cd backend && python -m uvicorn app.main:app --reload" -ForegroundColor Red
    exit 1
}

$HEADERS = @{ Authorization = "Bearer $TOKEN" }

# Step 3: Send 15 fake readings
Write-Host "[3/4] Sending fake sensor readings..." -ForegroundColor Yellow
Write-Host ""

$devices = @("esp32-001", "esp32-002")
$locations = @("Main Tank", "Reservoir A", "Supply Line")

for ($i = 1; $i -le 15; $i++) {
    # Mix of safe and unsafe values
    $isSafe = ($i % 4 -ne 0)

    if ($isSafe) {
        $ph        = [math]::Round((Get-Random -Minimum 65 -Maximum 85) / 10.0, 2)
        $tds       = Get-Random -Minimum 150 -Maximum 480
        $turbidity = [math]::Round((Get-Random -Minimum 5 -Maximum 38) / 10.0, 2)
        $temp      = [math]::Round((Get-Random -Minimum 180 -Maximum 320) / 10.0, 1)
    } else {
        $ph        = [math]::Round((Get-Random -Minimum 90 -Maximum 120) / 10.0, 2)
        $tds       = Get-Random -Minimum 600 -Maximum 900
        $turbidity = [math]::Round((Get-Random -Minimum 55 -Maximum 120) / 10.0, 2)
        $temp      = [math]::Round((Get-Random -Minimum 370 -Maximum 450) / 10.0, 1)
    }

    $device   = $devices[$i % $devices.Length]
    $location = $locations[$i % $locations.Length]

    $body = @{
        device_id   = $device
        location    = $location
        ph          = $ph
        tds         = $tds
        turbidity   = $turbidity
        temperature = $temp
    } | ConvertTo-Json

    try {
        $res = Invoke-RestMethod -Uri "$API/api/readings" -Method POST -Body $body -ContentType "application/json" -Headers $HEADERS
        $quality = $res.quality
        $emoji = if ($quality -eq "safe") { "OK  " } else { "WARN" }
        $color = if ($quality -eq "safe") { "Green" } else { "Red" }
        Write-Host "  [$emoji] Reading $i | $device | pH=$ph TDS=$tds Turb=$turbidity Temp=$temp C | Quality: $quality" -ForegroundColor $color
    } catch {
        Write-Host "  [ERR ] Reading $i failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "[4/4] Verifying data in backend..." -ForegroundColor Yellow
try {
    $readings = Invoke-RestMethod -Uri "$API/api/readings?page=1&page_size=5" -Method GET -Headers $HEADERS
    Write-Host "      Latest readings fetched successfully!" -ForegroundColor Green
} catch {
    Write-Host "      Could not verify (optional check)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Test Complete! Open your browser:" -ForegroundColor Green
Write-Host "  Dashboard  : http://localhost:5173" -ForegroundColor White
Write-Host "  Analytics  : http://localhost:5173/analytics" -ForegroundColor White
Write-Host "  Alerts     : http://localhost:5173/alerts" -ForegroundColor White
Write-Host "  API Docs   : http://localhost:8000/docs" -ForegroundColor White
Write-Host "=======================================" -ForegroundColor Cyan
