#!/usr/bin/env python
"""Test hospital admin API endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000"

endpoints = [
    "/api/hospitals/my_hospital/",
    "/api/doctors/my_doctors/",
    "/api/edoctor/doctors/my_edoctors/",
    "/api/appointments/hospital_appointments/",
    "/api/edoctor/consultations/hospital_consultations/",
    "/api/ambulance/services/my_ambulances/",
    "/api/ambulance/requests/hospital_requests/",
]

print("Testing Hospital Admin API Endpoints\n")
print("=" * 60)

for endpoint in endpoints:
    url = BASE_URL + endpoint
    try:
        response = requests.get(url, timeout=5)
        print(f"\nEndpoint: {endpoint}")
        print(f"Status Code: {response.status_code}")
        if response.status_code >= 400:
            print(f"Response: {response.text[:500]}")
    except Exception as e:
        print(f"\nEndpoint: {endpoint}")
        print(f"Error: {str(e)}")

print("\n" + "=" * 60)
