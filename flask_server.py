from flask import Flask
from flask_cors import CORS
import main as model

app = Flask(__name__)
CORS(app)

@app.route("/run")
def index():
    print("IT GOT HERE --------------------------------")
    return model.run_damodel()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)