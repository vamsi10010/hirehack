from flask import Flask
import main as model

app = Flask(__name__)

@app.route("/")
def index():
    return model.run_damodel()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)