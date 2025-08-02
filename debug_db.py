#!/usr/bin/env python3
"""
Debug script to check MongoDB data structure
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent / "backend"
load_dotenv(ROOT_DIR / '.env')

async def debug_database():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("=== Current Date Collection ===")
    async for doc in db.current_date.find({}):
        print(f"Document: {doc}")
    
    print("\n=== Events Collection ===")
    async for doc in db.events.find({}):
        print(f"Document: {doc}")
    
    # Test creating an event directly
    print("\n=== Creating Test Event ===")
    test_event = {
        "id": "test-uuid-12345",
        "year": 2025,
        "month": 3,
        "day": 15,
        "note": "Direct database test",
        "type": "event"
    }
    result = await db.events.insert_one(test_event)
    print(f"Inserted with _id: {result.inserted_id}")
    
    # Try to find it by id
    found_by_id = await db.events.find_one({"id": "test-uuid-12345"})
    print(f"Found by id field: {found_by_id}")
    
    # Try to find it by _id
    found_by_object_id = await db.events.find_one({"_id": result.inserted_id})
    print(f"Found by _id field: {found_by_object_id}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_database())