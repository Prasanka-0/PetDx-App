
from flask import Blueprint, request, jsonify
from PIL import Image
from utils.predict import predict_breed, predict_disease
from utils.database import save_scan
from utils.cloudinary_upload import upload_image
import io

predict_bp = Blueprint("predict", __name__)

def _get_cloudinary_url(file):
    """
    Re-read the uploaded file stream and push to Cloudinary.
    Returns the secure URL or empty string on failure.
    """
    try:
        file.stream.seek(0)   
        raw_bytes = file.stream.read()
        filename  = file.filename or "photo.jpg"
        url = upload_image(io.BytesIO(raw_bytes), filename)
        return url or ""
    except Exception as e:
        print(f"_get_cloudinary_url error: {e}")
        return ""


@predict_bp.route("/predict-breed", methods=["POST"])
def handle_predict_breed():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file  = request.files["file"]
    image = Image.open(file.stream).convert("RGB")

    breed_result  = predict_breed(image)
    cloudinary_url = _get_cloudinary_url(file)

    save_scan(
        image_uri=cloudinary_url,
        breed=breed_result["breed"],
        breed_confidence=breed_result["confidence"],
        disease="N/A",
        disease_confidence=0,
    )

    return jsonify({**breed_result, "imageUrl": cloudinary_url}), 200


@predict_bp.route("/predict-disease", methods=["POST"])
def handle_predict_disease():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file  = request.files["file"]
    image = Image.open(file.stream).convert("RGB")

    disease_result = predict_disease(image)
    cloudinary_url  = _get_cloudinary_url(file)

    save_scan(
        image_uri=cloudinary_url,
        breed="N/A",
        breed_confidence=0,
        disease=disease_result["disease"],
        disease_confidence=disease_result["confidence"],
    )

    return jsonify({**disease_result, "imageUrl": cloudinary_url}), 200