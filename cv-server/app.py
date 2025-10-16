# app.py
from flask import Flask, request, jsonify
import pickle
import os

app = Flask(__name__)

# check model for error
MODEL_PATH = 'models/model.pkl'
if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✓ Model loaded")
else:
    model = None
    print("⚠ No model found - run train.py first")

@app.route("/")
def index():
    return {"message": "Model loaded!"}

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return {"error": "Model not loaded"}, 503
    
    # prediction
    return {"message": "Prediction endpoint ready"}

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)