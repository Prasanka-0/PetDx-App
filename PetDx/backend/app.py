
from flask import Flask
from flask_cors import CORS
from routes.predict import predict_bp
from routes.scans import scans_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(predict_bp)
app.register_blueprint(scans_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)