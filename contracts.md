# Custom Calendar App - Backend Integration Contracts

## API Contracts

### 1. Calendar Date Management
- **GET /api/calendar/current-date** - Get the current custom date
- **PUT /api/calendar/current-date** - Set/update the current custom date
- **GET /api/calendar/dates/{year}/{month}** - Get all dates for a specific month

### 2. Events Management
- **GET /api/events/{year}/{month}** - Get all events for a specific month
- **POST /api/events** - Create a new event
- **PUT /api/events/{id}** - Update an existing event
- **DELETE /api/events/{id}** - Delete an event

## Data Models

### CurrentDate Model
```json
{
  "id": "string",
  "month": "number (0-9)", 
  "day": "number (1-30)",
  "year": "number",
  "updated_at": "datetime"
}
```

### Event Model
```json
{
  "id": "string",
  "year": "number",
  "month": "number (0-9)",
  "day": "number (1-30)", 
  "note": "string",
  "type": "string (event|special|deadline|today)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Mock Data to Replace

### From mock.js:
1. **mockCurrentCustomDate** → Replace with API call to `/api/calendar/current-date`
2. **mockEvents** → Replace with API call to `/api/events/{year}/{month}`
3. **Custom date setting** → Use PUT `/api/calendar/current-date`

## Backend Implementation Plan

### 1. MongoDB Collections:
- `current_date` - Single document storing the current custom date
- `events` - Collection of calendar events

### 2. FastAPI Endpoints:
- Calendar date management endpoints
- Event CRUD operations
- Input validation using Pydantic models
- Error handling for invalid dates/data

### 3. Business Logic:
- Validate custom date ranges (month: 0-9, day: 1-30)
- Ensure only one current date exists
- Handle event date validation against custom calendar system

## Frontend Integration Changes

### 1. Replace Mock Data:
- Remove dependency on mock.js data
- Add API service layer for backend calls
- Update state management to use real data

### 2. Add Loading States:
- Show loading indicators during API calls
- Handle error states gracefully
- Add optimistic updates for better UX

### 3. Real-time Updates:
- Current date changes persist immediately
- Events save and load from database
- Month navigation uses real data

## Custom Calendar System Rules
- 10 days per week: Peppermint Patty Day → Loin Cloth Day
- 10 months per year: Revan → Challenger  
- 3 weeks per month (30 days total)
- Day numbering: 1-30 per month
- Month indexing: 0-9 (zero-based)