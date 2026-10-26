
import unittest

from app import app


class DashboardTests(unittest.TestCase):

    def setUp(self):
        app.config["TESTING"] = True
        self.client = app.test_client()

    def test_dashboard_loads(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(
            b"Deployment Dashboard",
            response.data
        )

    def test_health_endpoint(self):
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(
            data["application"],
            "devops-dashboard"
        )

    def test_status_api(self):
        response = self.client.get("/api/status")

        self.assertEqual(response.status_code, 200)

        data = response.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("python_version", data)
        self.assertIn("uptime_seconds", data)
        self.assertIn("environment", data)


if __name__ == "__main__":
    unittest.main()
