
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

print(f"Connecting to MongoDB at: {MONGO_URI}")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

# Use the database
db = client["petdx"]
scans_collection = db["scans"]

def save_scan(image_uri, breed, breed_confidence, disease, disease_confidence):
    """
    Save a scan result to MongoDB
    """
    scan = {
        "imageUri": image_uri,
        "breed": breed,
        "breedConfidence": breed_confidence,
        "disease": disease,
        "diseaseConfidence": disease_confidence,
        "timestamp": datetime.utcnow().isoformat(),
    }
    result = scans_collection.insert_one(scan)
    print(f"Scan saved with ID: {result.inserted_id}")
    return str(result.inserted_id)

def get_all_scans():
    """
    Get all scans sorted by newest first
    """
    scans = scans_collection.find().sort("timestamp", -1)
    return [
        {
            "id": str(scan["_id"]),
            "imageUri": scan.get("imageUri", ""),
            "breed": scan.get("breed", "Unknown"),
            "breedConfidence": scan.get("breedConfidence", 0),
            "disease": scan.get("disease", "Unknown"),
            "diseaseConfidence": scan.get("diseaseConfidence", 0),
            "timestamp": scan.get("timestamp", ""),
        }
        for scan in scans
    ]

def delete_scan(scan_id):
    """
    Delete a scan by ID
    """
    try:
        result = scans_collection.delete_one({"_id": ObjectId(scan_id)})
        return result.deleted_count > 0
    except Exception as e:
        print(f"Error deleting scan: {e}")
        return False
    
    
    
    
    
    
    
    
# from pymongo import MongoClient
# from bson import ObjectId
# from datetime import datetime
# import os
# from dotenv import load_dotenv

# load_dotenv()

# client = MongoClient(os.getenv("MONGO_URI"))
# db = client["petdx"]
# scans_collection = db["scans"]

# def save_scan(image_uri, breed, breed_confidence, disease, disease_confidence):
#     """
#     Save a scan result to MongoDB
#     """
#     scan = {
#         "imageUri": image_uri,
#         "breed": breed,
#         "breedConfidence": breed_confidence,
#         "disease": disease,
#         "diseaseConfidence": disease_confidence,
#         "timestamp": datetime.utcnow().isoformat(),
#     }
#     result = scans_collection.insert_one(scan)
#     return str(result.inserted_id)

# def get_all_scans():
#     """
#     Get all scans sorted by newest first
#     """
#     scans = scans_collection.find().sort("timestamp", -1)
#     return [
#         {
#             "id": str(scan["_id"]),
#             "imageUri": scan.get("imageUri", ""),
#             "breed": scan.get("breed", "Unknown"),
#             "breedConfidence": scan.get("breedConfidence", 0),
#             "disease": scan.get("disease", "Unknown"),
#             "diseaseConfidence": scan.get("diseaseConfidence", 0),
#             "timestamp": scan.get("timestamp", ""),
#         }
#         for scan in scans
#     ]

# def delete_scan(scan_id):
#     """
#     Delete a scan by ID
#     """
#     scans_collection.delete_one({"_id": ObjectId(scan_id)})
#     return True