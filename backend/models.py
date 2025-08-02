from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import uuid

class CurrentDateCreate(BaseModel):
    month: int = Field(..., ge=0, le=9, description="Month index (0-9)")
    day: int = Field(..., ge=1, le=30, description="Day of month (1-30)")
    year: int = Field(..., ge=1, description="Year")

class CurrentDate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    month: int = Field(..., ge=0, le=9)
    day: int = Field(..., ge=1, le=30) 
    year: int = Field(..., ge=1)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EventCreate(BaseModel):
    year: int = Field(..., ge=1, description="Year")
    month: int = Field(..., ge=0, le=9, description="Month index (0-9)")
    day: int = Field(..., ge=1, le=30, description="Day of month (1-30)")
    note: str = Field(..., min_length=1, max_length=500, description="Event note")
    type: str = Field(default="event", description="Event type")
    
    @validator('type')
    def validate_type(cls, v):
        allowed_types = ["event", "special", "deadline", "today"]
        if v not in allowed_types:
            raise ValueError(f"Type must be one of: {allowed_types}")
        return v

class EventUpdate(BaseModel):
    note: Optional[str] = Field(None, min_length=1, max_length=500)
    type: Optional[str] = Field(None)
    
    @validator('type')
    def validate_type(cls, v):
        if v is not None:
            allowed_types = ["event", "special", "deadline", "today"]
            if v not in allowed_types:
                raise ValueError(f"Type must be one of: {allowed_types}")
        return v

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    year: int
    month: int
    day: int
    note: str
    type: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class EventResponse(BaseModel):
    id: str
    year: int
    month: int 
    day: int
    note: str
    type: str
    created_at: datetime
    updated_at: datetime