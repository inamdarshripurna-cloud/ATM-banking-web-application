#!/usr/bin/env python3
"""
Comprehensive API Testing Script for NexusBank Firebase Cloud Function
"""

import requests
import json
import time
from datetime import datetime

API_URL = "https://bank-api-grsqjakhza-uc.a.run.app"

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_response(response):
    """Pretty print API response"""
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
    except:
        print(response.text)
    print(f"Status Code: {response.status_code}\n")

# ============================================================
# TEST 1: HEALTH CHECK
# ============================================================
print_section("1. HEALTH CHECK")
try:
    r = requests.get(f"{API_URL}/health")
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 2: ADMIN INITIALIZATION
# ============================================================
print_section("2. ADMIN INITIALIZATION")
try:
    r = requests.get(f"{API_URL}/admin/init")
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 3: ADMIN LOGIN
# ============================================================
print_section("3. ADMIN LOGIN")
admin_session_id = None
try:
    payload = {
        "username": "admin",
        "password": "admin123"
    }
    r = requests.post(f"{API_URL}/admin/login", json=payload)
    data = r.json()
    admin_session_id = data.get("session_id")
    print_response(r)
    print(f"Admin Session ID: {admin_session_id}\n")
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 4: CREATE USER
# ============================================================
print_section("4. CREATE USER (Test User 1)")
user_mobile = "9876543210"
user_session_id = None
try:
    payload = {
        "name": "John Doe",
        "mobile": user_mobile,
        "password": "pass123",
        "email": "john@example.com",
        "city": "New York",
        "balance": 5000
    }
    r = requests.post(f"{API_URL}/add", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 5: CREATE SECOND USER
# ============================================================
print_section("5. CREATE USER (Test User 2)")
user2_mobile = "9876543211"
try:
    payload = {
        "name": "Jane Smith",
        "mobile": user2_mobile,
        "password": "pass456",
        "email": "jane@example.com",
        "city": "Los Angeles",
        "balance": 3000
    }
    r = requests.post(f"{API_URL}/add", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 6: USER LOGIN
# ============================================================
print_section("6. USER LOGIN")
try:
    payload = {
        "mobile": user_mobile,
        "password": "pass123"
    }
    r = requests.post(f"{API_URL}/login", json=payload)
    data = r.json()
    user_session_id = data.get("session_id")
    print_response(r)
    print(f"User Session ID: {user_session_id}\n")
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 7: GET ALL USERS
# ============================================================
print_section("7. GET ALL USERS (Public)")
try:
    r = requests.get(f"{API_URL}/read")
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 8: GET SINGLE USER
# ============================================================
print_section("8. GET SINGLE USER BY MOBILE")
try:
    r = requests.get(f"{API_URL}/user/{user_mobile}")
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 9: CHECK SESSION VALIDITY
# ============================================================
print_section("9. CHECK USER SESSION VALIDITY")
try:
    payload = {
        "session_id": user_session_id
    }
    r = requests.post(f"{API_URL}/check/session/{user_mobile}", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 10: GET USER BALANCE
# ============================================================
print_section("10. GET USER BALANCE")
try:
    payload = {
        "session_id": user_session_id
    }
    r = requests.post(f"{API_URL}/balance/{user_mobile}", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 11: DEPOSIT MONEY
# ============================================================
print_section("11. DEPOSIT MONEY")
try:
    payload = {
        "session_id": user_session_id,
        "amount": 1000
    }
    r = requests.post(f"{API_URL}/deposit/{user_mobile}", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 12: GET BALANCE AFTER DEPOSIT
# ============================================================
print_section("12. GET BALANCE AFTER DEPOSIT")
try:
    payload = {
        "session_id": user_session_id
    }
    r = requests.post(f"{API_URL}/balance/{user_mobile}", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 13: WITHDRAW MONEY
# ============================================================
print_section("13. WITHDRAW MONEY")
try:
    payload = {
        "session_id": user_session_id,
        "amount": 500
    }
    r = requests.post(f"{API_URL}/withdraw/{user_mobile}", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 14: TRANSFER MONEY
# ============================================================
print_section("14. TRANSFER MONEY TO ANOTHER USER")
try:
    payload = {
        "session_id": user_session_id,
        "receiver": user2_mobile,
        "amount": 200
    }
    r = requests.post(f"{API_URL}/transfer/{user_mobile}", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 15: GET USER TRANSACTIONS
# ============================================================
print_section("15. GET USER TRANSACTION HISTORY")
try:
    payload = {
        "session_id": user_session_id
    }
    r = requests.post(f"{API_URL}/transactions/{user_mobile}", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 16: UPDATE USER PROFILE
# ============================================================
print_section("16. UPDATE USER PROFILE")
try:
    payload = {
        "session_id": user_session_id,
        "city": "San Francisco",
        "email": "john.updated@example.com"
    }
    r = requests.put(f"{API_URL}/update/{user_mobile}", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 17: SEND MESSAGE
# ============================================================
print_section("17. SEND MESSAGE (Chat)")
try:
    payload = {
        "To_": user2_mobile,
        "From_": user_mobile,
        "Message": "Hello! This is a test message."
    }
    r = requests.post(f"{API_URL}/message", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# TEST 18: GET ALL MESSAGES
# ============================================================
print_section("18. GET ALL MESSAGES")
try:
    r = requests.get(f"{API_URL}/all_messages")
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
# ADMIN ENDPOINTS
# ============================================================
print_section("19. ADMIN: VIEW ALL USERS")
try:
    r = requests.get(f"{API_URL}/admin/users")
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
print_section("20. ADMIN: VIEW ALL TRANSACTIONS")
try:
    r = requests.get(f"{API_URL}/admin/transactions")
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
print_section("21. ADMIN: GET TOTAL BALANCE")
try:
    r = requests.get(f"{API_URL}/admin/total_balance")
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
print_section("22. ADMIN: VIEW SPECIFIC USER TRANSACTIONS")
try:
    r = requests.get(f"{API_URL}/admin/user/transactions/{user_mobile}")
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
print_section("23. ADMIN: ADJUST USER BALANCE (Deposit)")
try:
    payload = {
        "mobile": user_mobile,
        "amount": 500,
        "operation": "deposit"
    }
    r = requests.post(f"{API_URL}/admin/user/balance", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
print_section("24. ADMIN: UPDATE USER (Name & City)")
try:
    payload = {
        "name": "John Doe Updated",
        "city": "Boston"
    }
    r = requests.put(f"{API_URL}/admin/user/update/{user_mobile}", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
print_section("25. ADMIN: CHECK SESSION")
try:
    payload = {
        "username": "admin",
        "session_id": admin_session_id
    }
    r = requests.post(f"{API_URL}/admin/checksession", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
print_section("26. ADMIN: LOGOUT")
try:
    payload = {
        "username": "admin"
    }
    r = requests.post(f"{API_URL}/admin/logout", json=payload)
    print_response(r)
except Exception as e:
    print(f"Error: {e}\n")

# ============================================================
print_section("TEST SUMMARY")
print("✓ All API endpoints have been tested!")
print(f"API URL: {API_URL}")
print("="*60 + "\n")
