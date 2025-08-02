from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List

# Import our models and services
from models import CurrentDate, CurrentDateCreate, Event, EventCreate, EventUpdate, EventResponse
from services import CalendarService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Custom Calendar API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize services
calendar_service = CalendarService(db)

# Dependency to get calendar service
async def get_calendar_service():
    return calendar_service

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Custom Calendar API is running", "version": "1.0.0"}

# Current Date endpoints
@api_router.get("/calendar/current-date", response_model=CurrentDate)
async def get_current_date(service: CalendarService = Depends(get_calendar_service)):
    """Get the current custom date."""
    current_date = await service.get_current_date()
    if current_date:
        return current_date
    
    # If no current date exists, create a default one
    default_date = CurrentDateCreate(month=2, day=15, year=2025)  # Justin Thyme, day 15
    return await service.set_current_date(default_date)

@api_router.put("/calendar/current-date", response_model=CurrentDate)
async def set_current_date(
    date_data: CurrentDateCreate,
    service: CalendarService = Depends(get_calendar_service)
):
    """Set/update the current custom date."""
    try:
        return await service.set_current_date(date_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error setting current date: {str(e)}")

@api_router.get("/calendar/dates/{year}/{month}")
async def get_dates_for_month(
    year: int,
    month: int,
    service: CalendarService = Depends(get_calendar_service)
):
    """Get calendar dates for a specific month."""
    if month < 0 or month > 9:
        raise HTTPException(status_code=400, detail="Month must be between 0 and 9")
    
    # Return basic month structure (30 days)
    days = []
    for day in range(1, 31):
        days.append({
            "day": day,
            "month": month,
            "year": year,
            "custom_day_name": get_custom_day_name(day - 1)  # day-1 for 0-based indexing
        })
    
    return {
        "year": year,
        "month": month,
        "days": days,
        "total_days": 30
    }

# Events endpoints
@api_router.get("/events/{year}/{month}", response_model=List[EventResponse])
async def get_events_for_month(
    year: int,
    month: int,
    service: CalendarService = Depends(get_calendar_service)
):
    """Get all events for a specific month."""
    if month < 0 or month > 9:
        raise HTTPException(status_code=400, detail="Month must be between 0 and 9")
    
    events = await service.get_events_for_month(year, month)
    return [EventResponse(**event.dict()) for event in events]

@api_router.post("/events", response_model=EventResponse)
async def create_event(
    event_data: EventCreate,
    service: CalendarService = Depends(get_calendar_service)
):
    """Create a new event."""
    try:
        event = await service.create_event(event_data)
        return EventResponse(**event.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating event: {str(e)}")

@api_router.put("/events/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    service: CalendarService = Depends(get_calendar_service)
):
    """Update an existing event."""
    event = await service.update_event(event_id, event_data)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return EventResponse(**event.dict())

@api_router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    service: CalendarService = Depends(get_calendar_service)
):
    """Delete an event."""
    success = await service.delete_event(event_id)
    if not success:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"message": "Event deleted successfully"}

@api_router.get("/events/single/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    service: CalendarService = Depends(get_calendar_service)
):
    """Get a specific event by ID."""
    event = await service.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return EventResponse(**event.dict())

# Utility function for custom day names
def get_custom_day_name(day_index: int) -> str:
    """Get custom day name from day index (0-9)."""
    custom_days = [
        'Peppermint Patty Day',
        'Bing Bong Day', 
        'Wednesday',
        'Chewsday',
        'Mustang Day',
        'Second Wednesday',
        'Skip Day', 
        'Second Chewsday',
        'Sabbath',
        'Loin Cloth Day'
    ]
    return custom_days[day_index % 10]

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("Custom Calendar API started successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    logger.info("Database connection closed")