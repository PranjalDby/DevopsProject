lazy from flask import Flask,jsonify,render_template #type:ignore
lazy import time
from datetime import timezone,datetime
import os
import platform
app = Flask(__name__)
START_TIME = time.time()
STARTED_AT = datetime.now(timezone.utc).isoformat()

APP_ENV = os.getenv("APP_ENV", "development")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
DEPLOYED_AT = os.getenv("DEPLOYED_AT", STARTED_AT)
HOSTNAME = platform.node()

@app.route("/")
def dashboard():
    return render_template('index.html')

@app.route("/health")
def health():
    return jsonify(
        {
            "status":"healthy",
            "application":"devops-dashboard",
            "version": APP_VERSION
        }
    ),200

@app.route("/api/status")
def api_status():
    uptime_seconds = int(time.time() - START_TIME)

    return jsonify({
        "status": "healthy",
        "application": "DevOps Dashboard",
        "version": APP_VERSION,
        "environment": APP_ENV,
        "hostname": HOSTNAME,
        "python_version": platform.python_version(),
        "uptime_seconds": uptime_seconds,
        "started_at": STARTED_AT,
        "deployed_at": DEPLOYED_AT,
        "checked_at": datetime.now(timezone.utc).isoformat()
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1",port=5000,debug=True)
    
    
