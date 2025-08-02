#!/usr/bin/env python3
"""
Backend API Test Suite for Custom Calendar
Tests all API endpoints with validation rules and error handling
"""

import requests
import json
import os
from datetime import datetime
from typing import Dict, Any

# Get backend URL from environment
BACKEND_URL = "https://2839bf74-b2e7-4d06-ae59-cdf276f9258e.preview.emergentagent.com/api"

class CalendarAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def test_health_check(self):
        """Test basic API health check"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "Custom Calendar API" in data["message"]:
                    self.log_test("Health Check", True, f"API is running: {data['message']}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False
    
    def test_get_current_date_default(self):
        """Test GET /api/calendar/current-date - should create default if none exists"""
        try:
            response = self.session.get(f"{self.base_url}/calendar/current-date")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "month", "day", "year", "updated_at"]
                if all(field in data for field in expected_fields):
                    # Check default values
                    if data["month"] == 2 and data["day"] == 15 and data["year"] == 2025:
                        self.log_test("Get Current Date (Default)", True, f"Default date created: {data}")
                        return data
                    else:
                        self.log_test("Get Current Date (Default)", True, f"Current date exists: {data}")
                        return data
                else:
                    self.log_test("Get Current Date (Default)", False, f"Missing fields in response: {data}")
                    return None
            else:
                self.log_test("Get Current Date (Default)", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Get Current Date (Default)", False, f"Exception: {str(e)}")
            return None
    
    def test_update_current_date_valid(self):
        """Test PUT /api/calendar/current-date with valid data"""
        try:
            test_data = {
                "month": 5,
                "day": 20,
                "year": 2025
            }
            response = self.session.put(
                f"{self.base_url}/calendar/current-date",
                json=test_data
            )
            if response.status_code == 200:
                data = response.json()
                if (data["month"] == test_data["month"] and 
                    data["day"] == test_data["day"] and 
                    data["year"] == test_data["year"]):
                    self.log_test("Update Current Date (Valid)", True, f"Date updated successfully: {data}")
                    return True
                else:
                    self.log_test("Update Current Date (Valid)", False, f"Data mismatch: {data}")
                    return False
            else:
                self.log_test("Update Current Date (Valid)", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Update Current Date (Valid)", False, f"Exception: {str(e)}")
            return False
    
    def test_update_current_date_invalid_month(self):
        """Test PUT /api/calendar/current-date with invalid month"""
        try:
            test_data = {
                "month": 15,  # Invalid: should be 0-9
                "day": 20,
                "year": 2025
            }
            response = self.session.put(
                f"{self.base_url}/calendar/current-date",
                json=test_data
            )
            if response.status_code == 422:  # Validation error
                self.log_test("Update Current Date (Invalid Month)", True, "Correctly rejected invalid month")
                return True
            else:
                self.log_test("Update Current Date (Invalid Month)", False, f"Should have rejected invalid month. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Update Current Date (Invalid Month)", False, f"Exception: {str(e)}")
            return False
    
    def test_update_current_date_invalid_day(self):
        """Test PUT /api/calendar/current-date with invalid day"""
        try:
            test_data = {
                "month": 5,
                "day": 35,  # Invalid: should be 1-30
                "year": 2025
            }
            response = self.session.put(
                f"{self.base_url}/calendar/current-date",
                json=test_data
            )
            if response.status_code == 422:  # Validation error
                self.log_test("Update Current Date (Invalid Day)", True, "Correctly rejected invalid day")
                return True
            else:
                self.log_test("Update Current Date (Invalid Day)", False, f"Should have rejected invalid day. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Update Current Date (Invalid Day)", False, f"Exception: {str(e)}")
            return False
    
    def test_get_events_for_month_empty(self):
        """Test GET /api/events/{year}/{month} for empty month"""
        try:
            response = self.session.get(f"{self.base_url}/events/2025/3")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Events (Empty Month)", True, f"Retrieved {len(data)} events for month 3")
                    return data
                else:
                    self.log_test("Get Events (Empty Month)", False, f"Expected list, got: {type(data)}")
                    return None
            else:
                self.log_test("Get Events (Empty Month)", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Get Events (Empty Month)", False, f"Exception: {str(e)}")
            return None
    
    def test_get_events_invalid_month(self):
        """Test GET /api/events/{year}/{month} with invalid month"""
        try:
            response = self.session.get(f"{self.base_url}/events/2025/15")  # Invalid month
            if response.status_code == 400:
                self.log_test("Get Events (Invalid Month)", True, "Correctly rejected invalid month")
                return True
            else:
                self.log_test("Get Events (Invalid Month)", False, f"Should have rejected invalid month. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Events (Invalid Month)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_event_valid(self):
        """Test POST /api/events with valid data"""
        try:
            test_event = {
                "year": 2025,
                "month": 3,
                "day": 15,
                "note": "Important meeting with the Galactic Council",
                "type": "event"
            }
            response = self.session.post(
                f"{self.base_url}/events",
                json=test_event
            )
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "year", "month", "day", "note", "type", "created_at", "updated_at"]
                if all(field in data for field in expected_fields):
                    if (data["year"] == test_event["year"] and 
                        data["month"] == test_event["month"] and
                        data["day"] == test_event["day"] and
                        data["note"] == test_event["note"] and
                        data["type"] == test_event["type"]):
                        self.log_test("Create Event (Valid)", True, f"Event created: {data['id']}")
                        return data
                    else:
                        self.log_test("Create Event (Valid)", False, f"Data mismatch in created event")
                        return None
                else:
                    self.log_test("Create Event (Valid)", False, f"Missing fields in response: {data}")
                    return None
            else:
                self.log_test("Create Event (Valid)", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Create Event (Valid)", False, f"Exception: {str(e)}")
            return None
    
    def test_create_event_invalid_type(self):
        """Test POST /api/events with invalid event type"""
        try:
            test_event = {
                "year": 2025,
                "month": 3,
                "day": 15,
                "note": "Invalid event type test",
                "type": "invalid_type"  # Should be one of: event, special, deadline, today
            }
            response = self.session.post(
                f"{self.base_url}/events",
                json=test_event
            )
            if response.status_code == 422:  # Validation error
                self.log_test("Create Event (Invalid Type)", True, "Correctly rejected invalid event type")
                return True
            else:
                self.log_test("Create Event (Invalid Type)", False, f"Should have rejected invalid type. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Create Event (Invalid Type)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_event_invalid_month(self):
        """Test POST /api/events with invalid month"""
        try:
            test_event = {
                "year": 2025,
                "month": 12,  # Invalid: should be 0-9
                "day": 15,
                "note": "Invalid month test",
                "type": "event"
            }
            response = self.session.post(
                f"{self.base_url}/events",
                json=test_event
            )
            if response.status_code == 422:  # Validation error
                self.log_test("Create Event (Invalid Month)", True, "Correctly rejected invalid month")
                return True
            else:
                self.log_test("Create Event (Invalid Month)", False, f"Should have rejected invalid month. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Create Event (Invalid Month)", False, f"Exception: {str(e)}")
            return False
    
    def test_get_event_by_id(self, event_id: str):
        """Test GET /api/events/single/{event_id}"""
        try:
            response = self.session.get(f"{self.base_url}/events/single/{event_id}")
            if response.status_code == 200:
                data = response.json()
                if data["id"] == event_id:
                    self.log_test("Get Event by ID", True, f"Retrieved event: {data['note']}")
                    return data
                else:
                    self.log_test("Get Event by ID", False, f"ID mismatch: expected {event_id}, got {data['id']}")
                    return None
            elif response.status_code == 404:
                self.log_test("Get Event by ID", False, f"Event not found: {event_id}")
                return None
            else:
                self.log_test("Get Event by ID", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Get Event by ID", False, f"Exception: {str(e)}")
            return None
    
    def test_get_event_by_invalid_id(self):
        """Test GET /api/events/single/{event_id} with invalid ID"""
        try:
            fake_id = "nonexistent-id-12345"
            response = self.session.get(f"{self.base_url}/events/single/{fake_id}")
            if response.status_code == 404:
                self.log_test("Get Event by Invalid ID", True, "Correctly returned 404 for invalid ID")
                return True
            else:
                self.log_test("Get Event by Invalid ID", False, f"Should have returned 404. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Event by Invalid ID", False, f"Exception: {str(e)}")
            return False
    
    def test_update_event(self, event_id: str):
        """Test PUT /api/events/{event_id}"""
        try:
            update_data = {
                "note": "Updated meeting with the Intergalactic Federation",
                "type": "special"
            }
            response = self.session.put(
                f"{self.base_url}/events/{event_id}",
                json=update_data
            )
            if response.status_code == 200:
                data = response.json()
                if (data["note"] == update_data["note"] and 
                    data["type"] == update_data["type"]):
                    self.log_test("Update Event", True, f"Event updated successfully")
                    return data
                else:
                    self.log_test("Update Event", False, f"Update data mismatch")
                    return None
            elif response.status_code == 404:
                self.log_test("Update Event", False, f"Event not found: {event_id}")
                return None
            else:
                self.log_test("Update Event", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Update Event", False, f"Exception: {str(e)}")
            return None
    
    def test_update_event_invalid_id(self):
        """Test PUT /api/events/{event_id} with invalid ID"""
        try:
            fake_id = "nonexistent-id-12345"
            update_data = {
                "note": "This should fail",
                "type": "event"
            }
            response = self.session.put(
                f"{self.base_url}/events/{fake_id}",
                json=update_data
            )
            if response.status_code == 404:
                self.log_test("Update Event (Invalid ID)", True, "Correctly returned 404 for invalid ID")
                return True
            else:
                self.log_test("Update Event (Invalid ID)", False, f"Should have returned 404. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Update Event (Invalid ID)", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_event(self, event_id: str):
        """Test DELETE /api/events/{event_id}"""
        try:
            response = self.session.delete(f"{self.base_url}/events/{event_id}")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "deleted" in data["message"].lower():
                    self.log_test("Delete Event", True, f"Event deleted successfully")
                    return True
                else:
                    self.log_test("Delete Event", False, f"Unexpected response: {data}")
                    return False
            elif response.status_code == 404:
                self.log_test("Delete Event", False, f"Event not found: {event_id}")
                return False
            else:
                self.log_test("Delete Event", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Delete Event", False, f"Exception: {str(e)}")
            return False
    
    def test_delete_event_invalid_id(self):
        """Test DELETE /api/events/{event_id} with invalid ID"""
        try:
            fake_id = "nonexistent-id-12345"
            response = self.session.delete(f"{self.base_url}/events/{fake_id}")
            if response.status_code == 404:
                self.log_test("Delete Event (Invalid ID)", True, "Correctly returned 404 for invalid ID")
                return True
            else:
                self.log_test("Delete Event (Invalid ID)", False, f"Should have returned 404. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Delete Event (Invalid ID)", False, f"Exception: {str(e)}")
            return False
    
    def test_get_calendar_dates(self):
        """Test GET /api/calendar/dates/{year}/{month}"""
        try:
            response = self.session.get(f"{self.base_url}/calendar/dates/2025/4")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["year", "month", "days", "total_days"]
                if all(field in data for field in expected_fields):
                    if (data["year"] == 2025 and 
                        data["month"] == 4 and 
                        data["total_days"] == 30 and
                        len(data["days"]) == 30):
                        # Check first day structure
                        first_day = data["days"][0]
                        if all(field in first_day for field in ["day", "month", "year", "custom_day_name"]):
                            self.log_test("Get Calendar Dates", True, f"Retrieved calendar for 2025/4 with {len(data['days'])} days")
                            return data
                        else:
                            self.log_test("Get Calendar Dates", False, f"Missing fields in day structure")
                            return None
                    else:
                        self.log_test("Get Calendar Dates", False, f"Data structure mismatch")
                        return None
                else:
                    self.log_test("Get Calendar Dates", False, f"Missing fields in response: {data}")
                    return None
            else:
                self.log_test("Get Calendar Dates", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
        except Exception as e:
            self.log_test("Get Calendar Dates", False, f"Exception: {str(e)}")
            return None
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print(f"🚀 Starting Custom Calendar API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test 1: Health check
        if not self.test_health_check():
            print("❌ API is not responding. Stopping tests.")
            return False
        
        # Test 2: Current date operations
        current_date = self.test_get_current_date_default()
        self.test_update_current_date_valid()
        self.test_update_current_date_invalid_month()
        self.test_update_current_date_invalid_day()
        
        # Test 3: Calendar dates
        self.test_get_calendar_dates()
        
        # Test 4: Event operations - basic
        self.test_get_events_for_month_empty()
        self.test_get_events_invalid_month()
        
        # Test 5: Create events
        created_event = self.test_create_event_valid()
        self.test_create_event_invalid_type()
        self.test_create_event_invalid_month()
        
        # Test 6: Event operations with created event
        if created_event:
            event_id = created_event["id"]
            self.test_get_event_by_id(event_id)
            self.test_update_event(event_id)
            self.test_delete_event(event_id)
        
        # Test 7: Error handling
        self.test_get_event_by_invalid_id()
        self.test_update_event_invalid_id()
        self.test_delete_event_invalid_id()
        
        # Summary
        print("=" * 60)
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Custom Calendar API is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            failed_tests = [result for result in self.test_results if not result["success"]]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return False

def main():
    """Main test execution"""
    tester = CalendarAPITester()
    success = tester.run_all_tests()
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)