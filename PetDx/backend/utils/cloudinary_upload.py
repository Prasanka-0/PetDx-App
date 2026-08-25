
import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

def upload_image(file_stream, filename):
    """
    Upload image stream to Cloudinary and return the secure URL
    """
    try:
        result = cloudinary.uploader.upload(
            file_stream,
            folder="petdx/scans",
            public_id=filename.rsplit(".", 1)[0], 
            overwrite=True,
            resource_type="image",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"}, 
                {"quality": "auto:good"},                        
                {"fetch_format": "auto"},                   
            ],
        )
        return result.get("secure_url")
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None