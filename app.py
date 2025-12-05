import json
import os
import sqlite3
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

load_dotenv()

APP_ROOT = Path(__file__).parent
DB_PATH = Path(os.getenv("DB_PATH", APP_ROOT / "kids.db"))
ADMIN_KEY = os.getenv("ADMIN_KEY", "admin123")
PORT = int(os.getenv("PORT", "8444"))

app = Flask(__name__, static_folder=str(APP_ROOT / "public"), static_url_path="")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS child_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            child_name TEXT NOT NULL,
            child_token TEXT NOT NULL,
            activity TEXT NOT NULL,
            score INTEGER NOT NULL,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_child_token ON child_progress (child_name, child_token)"
    )
    conn.commit()
    conn.close()


def serialize_row(row):
    details = {}
    if row["details"]:
        try:
            details = json.loads(row["details"])
        except json.JSONDecodeError:
            details = {"raw": row["details"]}
    return {
        "childName": row["child_name"],
        "activity": row["activity"],
        "score": row["score"],
        "details": details,
        "createdAt": row["created_at"],
    }


@app.post("/api/progress")
def save_progress():
    payload = request.get_json(silent=True) or {}
    child_name = (payload.get("childName") or "").strip()
    child_token = payload.get("childToken") or ""
    activity = (payload.get("activity") or "").strip()
    score = payload.get("score")
    details = payload.get("details")

    if not child_name or not child_token or not activity or not isinstance(score, int):
        return (
            jsonify({"error": "childName, childToken, activity en score zijn verplicht."}),
            400,
        )

    try:
        conn = get_connection()
        conn.execute(
            "INSERT INTO child_progress (child_name, child_token, activity, score, details) VALUES (?, ?, ?, ?, ?)",
            (child_name, child_token, activity, score, json.dumps(details or {})),
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except sqlite3.Error:
        return jsonify({"error": "Kon progressie niet opslaan"}), 500


@app.get("/api/admin/progress")
def admin_progress():
    if request.headers.get("x-admin-key") != ADMIN_KEY:
        return jsonify({"error": "Admin sleutel ongeldig"}), 401

    conn = get_connection()
    rows = conn.execute(
        """
        SELECT child_name, activity, score, details, created_at
        FROM child_progress
        ORDER BY created_at DESC
        """
    ).fetchall()
    conn.close()
    return jsonify([serialize_row(row) for row in rows])


@app.get("/api/children/<name>")
def child_progress(name):
    token = request.headers.get("x-child-token")
    if not token:
        return jsonify({"error": "child token ontbreekt"}), 401

    conn = get_connection()
    rows = conn.execute(
        """
        SELECT activity, score, details, created_at
        FROM child_progress
        WHERE child_name = ? AND child_token = ?
        ORDER BY created_at DESC
        """,
        (name, token),
    ).fetchall()
    conn.close()

    serialized = []
    for row in rows:
        details = {}
        if row["details"]:
            try:
                details = json.loads(row["details"])
            except json.JSONDecodeError:
                details = {"raw": row["details"]}
        serialized.append(
            {
                "activity": row["activity"],
                "score": row["score"],
                "details": details,
                "createdAt": row["created_at"],
            }
        )
    return jsonify(serialized)


@app.get("/api/health")
def health():
    try:
        conn = get_connection()
        conn.execute("SELECT 1")
        conn.close()
        return jsonify({"ok": True, "db": str(DB_PATH)})
    except sqlite3.Error:
        return jsonify({"ok": False, "error": "database not reachable"}), 503


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/admin")
def admin_page():
    return send_from_directory(app.static_folder, "admin.html")


@app.errorhandler(404)
def not_found(_error):
    return send_from_directory(app.static_folder, "index.html")


def create_app():
    init_db()
    return app


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=PORT)
