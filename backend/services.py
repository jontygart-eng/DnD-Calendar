from motor.motor_asyncio import AsyncIOMotorDatabase
from models import CurrentDate, CurrentDateCreate, Event, EventCreate, EventUpdate
from typing import Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class CalendarService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.current_date_collection = db.current_date
        self.events_collection = db.events

    async def get_current_date(self) -> Optional[CurrentDate]:
        """Get the current custom date."""
        try:
            doc = await self.current_date_collection.find_one({})
            if doc:
                doc['id'] = str(doc['_id'])
                return CurrentDate(**doc)
            return None
        except Exception as e:
            logger.error(f"Error getting current date: {e}")
            return None

    async def set_current_date(self, date_data: CurrentDateCreate) -> CurrentDate:
        """Set/update the current custom date."""
        try:
            current_date = CurrentDate(**date_data.dict())
            
            # Replace the single current date document
            await self.current_date_collection.delete_many({})
            result = await self.current_date_collection.insert_one(current_date.dict())
            
            current_date.id = str(result.inserted_id)
            return current_date
        except Exception as e:
            logger.error(f"Error setting current date: {e}")
            raise

    async def get_events_for_month(self, year: int, month: int) -> List[Event]:
        """Get all events for a specific month."""
        try:
            cursor = self.events_collection.find({"year": year, "month": month})
            events = []
            async for doc in cursor:
                doc['id'] = str(doc['_id'])
                events.append(Event(**doc))
            return events
        except Exception as e:
            logger.error(f"Error getting events for {year}/{month}: {e}")
            return []

    async def create_event(self, event_data: EventCreate) -> Event:
        """Create a new event."""
        try:
            event = Event(**event_data.dict())
            # Store the original UUID before insertion
            original_id = event.id
            result = await self.events_collection.insert_one(event.dict())
            # Keep the original UUID as the event ID, not the ObjectId
            event.id = original_id
            return event
        except Exception as e:
            logger.error(f"Error creating event: {e}")
            raise

    async def update_event(self, event_id: str, event_data: EventUpdate) -> Optional[Event]:
        """Update an existing event."""
        try:
            update_data = {k: v for k, v in event_data.dict().items() if v is not None}
            if not update_data:
                return None
            
            update_data['updated_at'] = datetime.utcnow()
            
            result = await self.events_collection.find_one_and_update(
                {"id": event_id},
                {"$set": update_data},
                return_document=True
            )
            
            if result:
                result['id'] = str(result['_id']) if 'id' not in result else result['id']
                return Event(**result)
            return None
        except Exception as e:
            logger.error(f"Error updating event {event_id}: {e}")
            return None

    async def delete_event(self, event_id: str) -> bool:
        """Delete an event."""
        try:
            result = await self.events_collection.delete_one({"id": event_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting event {event_id}: {e}")
            return False

    async def get_event_by_id(self, event_id: str) -> Optional[Event]:
        """Get a specific event by ID."""
        try:
            doc = await self.events_collection.find_one({"id": event_id})
            if doc:
                doc['id'] = str(doc['_id']) if 'id' not in doc else doc['id']
                return Event(**doc)
            return None
        except Exception as e:
            logger.error(f"Error getting event {event_id}: {e}")
            return None