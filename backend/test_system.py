import unittest
import json
from app import create_app
from database.db import db
from models.user import User
from models.request import Request
from models.volunteer import Volunteer
from models.notification import Notification

class CareConnectSystemTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def register_user(self, name, email, password, role):
        return self.client.post("/api/register", json={
            "name": name,
            "email": email,
            "password": password,
            "role": role
        })

    def login_user(self, email, password):
        return self.client.post("/api/login", json={
            "email": email,
            "password": password
        })

    def test_full_workflow(self):
        # 1. Register Elder
        reg_elder = self.register_user("Test Elder", "elder@care.org", "Password123!", "elder")
        self.assertEqual(reg_elder.status_code, 201)
        elder_token = reg_elder.json["data"]["token"]
        elder_id = reg_elder.json["data"]["user"]["id"]

        # 2. Register Volunteer
        reg_vol = self.register_user("Test Volunteer", "volunteer@care.org", "Password123!", "volunteer")
        self.assertEqual(reg_vol.status_code, 201)
        vol_token = reg_vol.json["data"]["token"]
        vol_id = reg_vol.json["data"]["user"]["id"]

        # 3. Register Admin
        reg_admin = self.register_user("Test Admin", "admin@care.org", "Password123!", "admin")
        self.assertEqual(reg_admin.status_code, 201)
        admin_token = reg_admin.json["data"]["token"]

        # 4. Profile validation
        prof_res = self.client.get("/api/profile", headers={"Authorization": f"Bearer {elder_token}"})
        self.assertEqual(prof_res.status_code, 200)
        self.assertEqual(prof_res.json["data"]["email"], "elder@care.org")

        # 5. Create Request (Elder)
        req_res = self.client.post("/api/requests", json={
            "assistance_type": "grocery",
            "description": "Need groceries delivered urgently for dinner",
            "priority": "high",
            "location": "123 Care Street"
        }, headers={"Authorization": f"Bearer {elder_token}"})
        self.assertEqual(req_res.status_code, 201)
        req_id = req_res.json["data"]["id"]

        # Check duplicate creation prevention
        dup_res = self.client.post("/api/requests", json={
            "assistance_type": "grocery",
            "description": "Need groceries delivered urgently for dinner",
            "priority": "high",
            "location": "123 Care Street"
        }, headers={"Authorization": f"Bearer {elder_token}"})
        self.assertEqual(dup_res.status_code, 409)

        # 6. Volunteer fetches pending requests
        vol_reqs = self.client.get("/api/requests", headers={"Authorization": f"Bearer {vol_token}"})
        self.assertEqual(vol_reqs.status_code, 200)
        requests_list = vol_reqs.json["data"]["requests"]
        self.assertTrue(any(r["id"] == req_id for r in requests_list))

        # Check volunteer received notification for request creation
        vol_notifs = self.client.get("/api/notifications", headers={"Authorization": f"Bearer {vol_token}"})
        self.assertEqual(vol_notifs.status_code, 200)
        self.assertGreater(vol_notifs.json["data"]["unread_count"], 0)

        # 7. Volunteer accepts request
        accept_res = self.client.put(f"/api/requests/{req_id}", json={"status": "accepted"}, headers={"Authorization": f"Bearer {vol_token}"})
        self.assertEqual(accept_res.status_code, 200)
        self.assertEqual(accept_res.json["data"]["status"], "accepted")

        # Check Elder received notification that request was accepted
        elder_notifs = self.client.get("/api/notifications", headers={"Authorization": f"Bearer {elder_token}"})
        self.assertEqual(elder_notifs.status_code, 200)
        self.assertTrue(any(n["type"] == "request_accepted" for n in elder_notifs.json["data"]["notifications"]))

        # 8. Volunteer updates status to in_progress
        progress_res = self.client.put(f"/api/requests/{req_id}", json={"status": "in_progress"}, headers={"Authorization": f"Bearer {vol_token}"})
        self.assertEqual(progress_res.status_code, 200)
        self.assertEqual(progress_res.json["data"]["status"], "in_progress")

        # 9. Volunteer completes request
        complete_res = self.client.put(f"/api/requests/{req_id}", json={"status": "completed"}, headers={"Authorization": f"Bearer {vol_token}"})
        self.assertEqual(complete_res.status_code, 200)
        self.assertEqual(complete_res.json["data"]["status"], "completed")

        # Verify volunteer completed_tasks counter in profile
        vol_prof = self.client.get("/api/profile", headers={"Authorization": f"Bearer {vol_token}"})
        self.assertEqual(vol_prof.json["data"]["completed_tasks"], 1)

        # Re-submitting completed status must NOT increment completed_tasks again
        self.client.put(f"/api/requests/{req_id}", json={"status": "completed"}, headers={"Authorization": f"Bearer {vol_token}"})
        vol_prof_2 = self.client.get("/api/profile", headers={"Authorization": f"Bearer {vol_token}"})
        self.assertEqual(vol_prof_2.json["data"]["completed_tasks"], 1)

        # 10. Admin Stats Verification
        admin_stats = self.client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
        self.assertEqual(admin_stats.status_code, 200)
        self.assertEqual(admin_stats.json["data"]["completed_requests"], 1)

        # 11. Security Scoping Checks: Elder cannot view another user's single request
        other_elder = self.register_user("Other Elder", "other@care.org", "Password123!", "elder")
        other_token = other_elder.json["data"]["token"]
        unauth_get = self.client.get(f"/api/requests/{req_id}", headers={"Authorization": f"Bearer {other_token}"})
        self.assertEqual(unauth_get.status_code, 403)

        print("ALL SYSTEM TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    unittest.main()
