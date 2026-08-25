
from flask import Blueprint, jsonify, request
from utils.database import get_all_scans, delete_scan, save_scan

scans_bp = Blueprint("scans", __name__)

@scans_bp.route("/scans", methods=["GET"])
def handle_get_scans():
    """
    Get all scan history
    """
    try:
        scans = get_all_scans()
        return jsonify(scans), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@scans_bp.route("/scans/<scan_id>", methods=["DELETE"])
def handle_delete_scan(scan_id):
    """
    Delete a scan by ID
    """
    try:
        delete_scan(scan_id)
        return jsonify({"message": "Scan deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500