"""
AquaSense ML Training Script
Generates synthetic water quality dataset and trains a RandomForest classifier.
Run: python ml/train.py
"""
import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import joblib

SEED = 42
np.random.seed(SEED)

# ─── Generate synthetic dataset ───
def generate_dataset(n_samples: int = 5000) -> pd.DataFrame:
    records = []

    # Safe water (label=1) — values within WHO standards
    n_safe = int(n_samples * 0.6)
    safe = {
        "ph":          np.random.normal(7.2, 0.4, n_safe).clip(6.5, 8.5),
        "tds":         np.random.normal(200, 80, n_safe).clip(50, 500),
        "turbidity":   np.random.normal(1.5, 0.7, n_safe).clip(0, 4.0),
        "temperature": np.random.normal(22, 4, n_safe).clip(10, 35),
        "quality":     np.ones(n_safe, dtype=int),
    }
    # Unsafe water (label=0) — values outside safe ranges
    n_unsafe = n_samples - n_safe
    unsafe = {
        "ph":          np.concatenate([
            np.random.normal(5.0, 0.8, n_unsafe // 2).clip(0, 6.4),
            np.random.normal(9.5, 0.5, n_unsafe - n_unsafe // 2).clip(8.6, 14),
        ]),
        "tds":         np.random.normal(800, 200, n_unsafe).clip(501, 2000),
        "turbidity":   np.random.normal(8, 3, n_unsafe).clip(4.1, 30),
        "temperature": np.concatenate([
            np.random.normal(5, 2, n_unsafe // 2).clip(-5, 9.9),
            np.random.normal(42, 5, n_unsafe - n_unsafe // 2).clip(35.1, 60),
        ]),
        "quality":     np.zeros(n_unsafe, dtype=int),
    }

    df_safe = pd.DataFrame(safe)
    df_unsafe = pd.DataFrame(unsafe)
    df = pd.concat([df_safe, df_unsafe], ignore_index=True).sample(frac=1, random_state=SEED)
    return df


def train():
    print("AquaSense - ML Training")
    print("=" * 40)

    # 1. Generate data
    print("Generating dataset...")
    df = generate_dataset(5000)

    # Save dataset
    os.makedirs("ml/dataset", exist_ok=True)
    df.to_csv("ml/dataset/water_quality.csv", index=False)
    print(f"   Saved {len(df)} samples -> ml/dataset/water_quality.csv")
    print(f"   Safe: {(df.quality == 1).sum()}  |  Unsafe: {(df.quality == 0).sum()}")

    # 2. Prepare features
    X = df[["ph", "tds", "turbidity", "temperature"]].values
    y = df["quality"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=SEED)

    # 3. Scale
    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    # 4. Train
    print("\nTraining RandomForest...")
    model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=SEED, n_jobs=-1)
    model.fit(X_train_s, y_train)

    # 5. Evaluate
    y_pred = model.predict(X_test_s)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {acc * 100:.2f}%")
    print("\n" + classification_report(y_test, y_pred, target_names=["Unsafe", "Safe"]))

    # 6. Save model
    os.makedirs("ml/models", exist_ok=True)
    joblib.dump(model, "ml/models/water_quality_model.joblib")
    joblib.dump(scaler, "ml/models/scaler.joblib")
    print("Model saved -> ml/models/water_quality_model.joblib")
    print("Scaler saved -> ml/models/scaler.joblib")

    # 7. Feature importances
    features = ["pH", "TDS", "Turbidity", "Temperature"]
    importances = model.feature_importances_
    print("\nFeature Importances:")
    for f, imp in sorted(zip(features, importances), key=lambda x: -x[1]):
        bar = "=" * int(imp * 40)
        print(f"   {f:<12} {bar} {imp:.4f}")


if __name__ == "__main__":
    train()
