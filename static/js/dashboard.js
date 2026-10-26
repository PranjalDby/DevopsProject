
const statusUrl = "/api/status";
const healthUrl = "/health";

const $ = (id) => document.getElementById(id);

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

function formatDate(value) {
    if (!value) return "Not available";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString();
}

function setConnection(online, message) {
    const indicator = $("connection-indicator");

    indicator.textContent = message;
    indicator.classList.toggle("online", online);
    indicator.classList.toggle("offline", !online);
}

async function loadStatus() {
    try {
        const response = await fetch(statusUrl, { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        $("app-status").textContent = data.status;
        $("app-version").textContent = data.version;
        $("environment").textContent = data.environment;
        $("hostname").textContent = data.hostname || "Unknown";
        $("python-version").textContent = data.python_version;
        $("uptime").textContent = formatUptime(data.uptime_seconds);
        $("started-at").textContent = formatDate(data.started_at);
        $("deployed-at").textContent = formatDate(data.deployed_at);
        $("last-checked").textContent = formatDate(data.checked_at);

        $("app-status").className = "value status-good";
        setConnection(true, "Connected");
    } catch (error) {
        $("app-status").textContent = "Unavailable";
        $("app-status").className = "value status-bad";
        setConnection(false, "Connection failed");
        $("last-checked").textContent = new Date().toLocaleString();

        console.error("Dashboard status request failed:", error);
    }
}

async function runHealthCheck() {
    const button = $("health-check-button");
    const result = $("health-result");

    button.disabled = true;
    button.textContent = "Checking...";
    result.textContent = "Contacting health endpoint...";
    result.className = "health-result";

    try {
        const response = await fetch(healthUrl, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok || data.status !== "healthy") {
            throw new Error("Health check returned an unhealthy status");
        }

        result.textContent =
            `PASS — ${data.application} v${data.version} is healthy.`;
        result.className = "health-result success";
    } catch (error) {
        result.textContent = `FAIL — ${error.message}`;
        result.className = "health-result failure";
    } finally {
        button.disabled = false;
        button.textContent = "Run health check";
        await loadStatus();
    }
}

$("refresh-button").addEventListener("click", loadStatus);
$("health-check-button").addEventListener("click", runHealthCheck);

loadStatus();
setInterval(loadStatus, 10000);
