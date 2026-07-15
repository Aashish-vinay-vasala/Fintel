import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import os

def generate_credit_data(n=6000):
    np.random.seed(99)

    approved = pd.DataFrame({
        "age": np.random.randint(25, 60, int(n * 0.65)),
        "income": np.random.lognormal(11, 0.5, int(n * 0.65)),
        "loan_amount": np.random.lognormal(10, 0.6, int(n * 0.65)),
        "credit_score": np.random.randint(700, 900, int(n * 0.65)),
        "employment_years": np.random.randint(2, 20, int(n * 0.65)),
        "existing_loans": np.random.randint(0, 2, int(n * 0.65)),
        "missed_payments": np.random.randint(0, 1, int(n * 0.65)),
        "debt_to_income": np.random.uniform(0.1, 0.35, int(n * 0.65)),
        "label": 1
    })

    rejected = pd.DataFrame({
        "age": np.random.randint(18, 35, int(n * 0.35)),
        "income": np.random.lognormal(9.5, 0.8, int(n * 0.35)),
        "loan_amount": np.random.lognormal(11, 0.8, int(n * 0.35)),
        "credit_score": np.random.randint(300, 650, int(n * 0.35)),
        "employment_years": np.random.randint(0, 3, int(n * 0.35)),
        "existing_loans": np.random.randint(2, 6, int(n * 0.35)),
        "missed_payments": np.random.randint(2, 8, int(n * 0.35)),
        "debt_to_income": np.random.uniform(0.4, 0.9, int(n * 0.35)),
        "label": 0
    })

    return pd.concat([approved, rejected]).sample(frac=1).reset_index(drop=True)

def train_model():
    df = generate_credit_data()
    X = df.drop("label", axis=1)
    y = df["label"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    model = XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.1,
        random_state=42,
        eval_metric="logloss"
    )
    model.fit(X_train, y_train)

    os.makedirs("credit", exist_ok=True)
    with open("credit/credit_model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open("credit/credit_scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)

    print("Credit model trained and saved.")
    return model, scaler

def load_model():
    if not os.path.exists("credit/credit_model.pkl"):
        return train_model()
    with open("credit/credit_model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("credit/credit_scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    return model, scaler

def predict(application: dict, model, scaler):
    features = ["age", "income", "loan_amount", "credit_score",
                 "employment_years", "existing_loans", "missed_payments", "debt_to_income"]
    X = np.array([[application[f] for f in features]])
    X_scaled = scaler.transform(X)
    prob = model.predict_proba(X_scaled)[0][1]
    return round(float(prob), 4)