import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
import pickle
import os

def generate_synthetic_data(n=5000):
    np.random.seed(42)
    normal = pd.DataFrame({
        "amount": np.random.lognormal(4, 1, int(n * 0.95)),
        "hour": np.random.randint(8, 22, int(n * 0.95)),
        "frequency_24h": np.random.poisson(3, int(n * 0.95)),
        "avg_amount_7d": np.random.lognormal(4, 0.8, int(n * 0.95)),
        "distance_from_home": np.random.exponential(10, int(n * 0.95)),
        "is_foreign": np.random.binomial(1, 0.05, int(n * 0.95)),
        "same_city": np.random.binomial(1, 0.85, int(n * 0.95)),
        "label": 0
    })
    fraud = pd.DataFrame({
        "amount": np.random.lognormal(7, 1.5, int(n * 0.05)),
        "hour": np.random.choice([0, 1, 2, 3, 23], int(n * 0.05)),
        "frequency_24h": np.random.poisson(15, int(n * 0.05)),
        "avg_amount_7d": np.random.lognormal(3, 0.5, int(n * 0.05)),
        "distance_from_home": np.random.exponential(200, int(n * 0.05)),
        "is_foreign": np.random.binomial(1, 0.7, int(n * 0.05)),
        "same_city": np.random.binomial(1, 0.1, int(n * 0.05)),
        "label": 1
    })
    return pd.concat([normal, fraud]).sample(frac=1).reset_index(drop=True)

def train_model():
    df = generate_synthetic_data()
    X = df.drop("label", axis=1)
    y = df["label"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    model = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        scale_pos_weight=19,
        random_state=42,
        eval_metric="logloss"
    )
    model.fit(X_train, y_train)

    print(classification_report(y_test, model.predict(X_test)))

    os.makedirs("fraud", exist_ok=True)
    with open("fraud/model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open("fraud/scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    print("Model saved.")
    return model, scaler

def load_model():
    if not os.path.exists("fraud/model.pkl"):
        print("Training model for first time...")
        return train_model()
    with open("fraud/model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("fraud/scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    return model, scaler

def predict(transaction: dict, model, scaler):
    features = ["amount", "hour", "frequency_24h", "avg_amount_7d",
                 "distance_from_home", "is_foreign", "same_city"]
    X = np.array([[transaction[f] for f in features]])
    X_scaled = scaler.transform(X)
    prob = model.predict_proba(X_scaled)[0][1]
    return round(float(prob), 4)