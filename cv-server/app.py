from flask import Flask
import pickle

app = Flask(__name__)

with open('models/model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route("/")
def index():
    return {"message": "Model loaded!"}

if __name__ == "__main__":
    app.run(debug=True)