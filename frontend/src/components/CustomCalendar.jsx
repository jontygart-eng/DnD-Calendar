import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ChevronLeft, ChevronRight, Calendar, Settings, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { calendarApi, eventsApi, handleApiError } from '../services/api';

// Constants moved inline to reduce bundle size
const CUSTOM_DAYS = [
  'Peppermint Patty Day', 'Bing Bong Day', 'Wednesday', 'Chewsday', 'Mustang Day',
  'Second Wednesday', 'Skip Day', 'Second Chewsday', 'Sabbath', 'Loin Cloth Day'
];

const CUSTOM_MONTHS = [
  'Revan', 'Juno', 'Justin Thyme', 'Plato', 'Olivia Newton John',
  'Palmetto', 'Juice Daddy', 'Retrograde', 'Blizzrock', 'Challenger'
];

const DAYS_PER_MONTH = 30;

const getCustomDayName = (dayIndex) => CUSTOM_DAYS[dayIndex % 10];

const CustomCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(2); // Start with Justin Thyme
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedDate, setSelectedDate] = useState(null);
  
  // API data states
  const [customCurrentDate, setCustomCurrentDate] = useState({ month: 2, day: 15, year: 2025 });
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dialog states
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // Form states
  const [tempMonth, setTempMonth] = useState(2);
  const [tempDay, setTempDay] = useState(15);
  const [tempYear, setTempYear] = useState(2025);
  const [eventNote, setEventNote] = useState('');
  const [eventType, setEventType] = useState('event');

  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load events when month/year changes
  useEffect(() => {
    loadEventsForMonth(currentYear, currentMonth);
  }, [currentMonth, currentYear]);

  // Optimized data loading with useCallback
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const currentDate = await calendarApi.getCurrentDate();
      setCustomCurrentDate(currentDate);
      setCurrentMonth(currentDate.month);
      setCurrentYear(currentDate.year);
      await loadEventsForMonth(currentDate.year, currentDate.month);
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast?.({
        title: "Error loading data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadEventsForMonth = useCallback(async (year, month) => {
    try {
      const monthEvents = await eventsApi.getEventsForMonth(year, month);
      const eventsObj = {};
      monthEvents.forEach(event => {
        const key = `${event.year}-${event.month}-${event.day}`;
        eventsObj[key] = event;
      });
      
      setEvents(prevEvents => ({
        ...prevEvents,
        [`${year}-${month}`]: eventsObj
      }));
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast?.({
        title: "Error loading events",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Generate calendar grid for current month
  const calendarDays = useMemo(() => {
    const days = [];
    const totalDays = DAYS_PER_MONTH;
    const monthEventsKey = `${currentYear}-${currentMonth}`;
    const monthEvents = events[monthEventsKey] || {};
    
    for (let day = 1; day <= totalDays; day++) {
      const customDayName = getCustomDayName(day - 1);
      const dateKey = `${currentYear}-${currentMonth}-${day}`;
      const event = monthEvents[dateKey];
      const isToday = currentMonth === customCurrentDate.month && 
                     day === customCurrentDate.day && 
                     currentYear === customCurrentDate.year;
      
      days.push({
        day,
        customDayName,
        dateKey,
        event,
        isToday
      });
    }
    
    return days;
  }, [currentMonth, currentYear, customCurrentDate, events]);

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(CUSTOM_MONTHS.length - 1);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === CUSTOM_MONTHS.length - 1) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDayClick = (dayData) => {
    setSelectedDate(dayData);
  };

  const handleSetCustomDate = async () => {
    // Validate the date
    if (tempDay < 1 || tempDay > DAYS_PER_MONTH) {
      toast({
        title: "Invalid day",
        description: `Day must be between 1 and ${DAYS_PER_MONTH}`,
        variant: "destructive",
      });
      return;
    }
    
    if (tempYear < 1) {
      toast({
        title: "Invalid year",
        description: 'Year must be a positive number',
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const newCustomDate = {
        month: tempMonth,
        day: tempDay,
        year: tempYear
      };
      
      const updatedDate = await calendarApi.setCurrentDate(newCustomDate);
      setCustomCurrentDate(updatedDate);
      
      // Navigate to the month containing the new current date
      setCurrentMonth(tempMonth);
      setCurrentYear(tempYear);
      
      setIsDateDialogOpen(false);
      
      toast({
        title: "Date updated",
        description: "Custom current date has been set successfully",
      });
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error setting date",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDialogOpen = (open) => {
    setIsDateDialogOpen(open);
    if (open) {
      setTempMonth(customCurrentDate.month);
      setTempDay(customCurrentDate.day);
      setTempYear(customCurrentDate.year);
    }
  };

  const handleEventDialogOpen = (open, dayData = null, event = null) => {
    setIsEventDialogOpen(open);
    if (open && dayData) {
      setSelectedDate(dayData);
      if (event) {
        setEditingEvent(event);
        setEventNote(event.note);
        setEventType(event.type);
      } else {
        setEditingEvent(null);
        setEventNote('');
        setEventType('event');
      }
    } else {
      setEditingEvent(null);
      setEventNote('');
      setEventType('event');
    }
  };

  const handleSaveEvent = async () => {
    if (!eventNote.trim()) {
      toast({
        title: "Invalid event",
        description: "Event note cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const eventData = {
        year: currentYear,
        month: currentMonth,
        day: selectedDate.day,
        note: eventNote.trim(),
        type: eventType
      };

      if (editingEvent) {
        // Update existing event
        await eventsApi.updateEvent(editingEvent.id, { 
          note: eventNote.trim(), 
          type: eventType 
        });
      } else {
        // Create new event
        await eventsApi.createEvent(eventData);
      }

      // Reload events for current month
      await loadEventsForMonth(currentYear, currentMonth);
      
      setIsEventDialogOpen(false);
      
      toast({
        title: editingEvent ? "Event updated" : "Event created",
        description: "Event has been saved successfully",
      });
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error saving event",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    try {
      setSaving(true);
      await eventsApi.deleteEvent(event.id);
      await loadEventsForMonth(currentYear, currentMonth);
      
      toast({
        title: "Event deleted",
        description: "Event has been removed successfully",
      });
      
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error deleting event",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-lg text-slate-600">Loading your custom calendar...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Custom Calendar Tracker
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Track your days in the unique 10-day week system
          </p>
        </div>

        {/* Month Navigation */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateMonth('prev')}
                className="h-10 w-10 rounded-full hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800">
                  {CUSTOM_MONTHS[currentMonth]}
                </h2>
                <p className="text-slate-500 font-medium">{currentYear}</p>
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateMonth('next')}
                className="h-10 w-10 rounded-full hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Current Date Info & Set Date Button */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="px-3 py-1">
                  Current Date
                </Badge>
                <div className="text-lg">
                  <span className="font-semibold text-slate-800">
                    {getCustomDayName(customCurrentDate.day - 1)}, {CUSTOM_MONTHS[customCurrentDate.month]} {customCurrentDate.day}, {customCurrentDate.year}
                  </span>
                </div>
              </div>
              
              <Dialog open={isDateDialogOpen} onOpenChange={handleDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 hover:bg-indigo-50">
                    <Settings className="h-4 w-4" />
                    <span>Set Custom Date</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                      <span>Set Custom Current Date</span>
                    </DialogTitle>
                    <DialogDescription>
                      Set which date should be considered "today" in your custom calendar system.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="month-select">Month</Label>
                      <Select 
                        value={tempMonth.toString()} 
                        onValueChange={(value) => setTempMonth(parseInt(value))}
                      >
                        <SelectTrigger id="month-select">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {CUSTOM_MONTHS.map((month, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="day-input">Day (1-{DAYS_PER_MONTH})</Label>
                      <Input
                        id="day-input"
                        type="number"
                        min="1"
                        max={DAYS_PER_MONTH}
                        value={tempDay}
                        onChange={(e) => setTempDay(parseInt(e.target.value) || 1)}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="year-input">Year</Label>
                      <Input
                        id="year-input"
                        type="number"
                        min="1"
                        value={tempYear}
                        onChange={(e) => setTempYear(parseInt(e.target.value) || 2025)}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsDateDialogOpen(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSetCustomDate} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set Date"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Custom Day Names Header */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {CUSTOM_DAYS.map((dayName, index) => (
                <div key={index} className="text-center p-2">
                  <div className="text-xs md:text-sm font-semibold text-slate-600 truncate" title={dayName}>
                    {dayName}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-10 gap-1 md:gap-2">
              {calendarDays.map((dayData) => {
                const { day, customDayName, isToday, event } = dayData;
                
                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(dayData)}
                    className={`
                      relative aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105
                      ${isToday 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' 
                        : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200 hover:border-indigo-300'
                      }
                      ${event ? 'ring-2 ring-amber-400' : ''}
                      ${selectedDate?.day === day ? 'ring-2 ring-indigo-400' : ''}
                    `}
                  >
                    <div className="text-center">
                      <div className="text-base font-bold">{day}</div>
                      <div className="text-xs opacity-75 truncate" title={customDayName}>
                        {customDayName.split(' ')[0]}
                      </div>
                    </div>
                    {event && (
                      <div className="absolute -top-1 -right-1">
                        <div className="h-2 w-2 bg-amber-400 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Info */}
        {selectedDate && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className="text-sm">
                    Day {selectedDate.day}
                  </Badge>
                  <span className="text-xl text-slate-800">
                    {selectedDate.customDayName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleEventDialogOpen(true, selectedDate)}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Event</span>
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-slate-600">
                  <strong>Month:</strong> {CUSTOM_MONTHS[currentMonth]} {currentYear}
                </p>
                {selectedDate.event ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-amber-800 font-medium">
                          {selectedDate.event.note}
                        </p>
                        <Badge variant="outline" className="mt-2 text-xs">
                          {selectedDate.event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEventDialogOpen(true, selectedDate, selectedDate.event)}
                          disabled={saving}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEvent(selectedDate.event)}
                          disabled={saving}
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No events for this day</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Dialog */}
        <Dialog open={isEventDialogOpen} onOpenChange={handleEventDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                <span>{editingEvent ? 'Edit Event' : 'Add New Event'}</span>
              </DialogTitle>
              <DialogDescription>
                {selectedDate && `Add an event for ${selectedDate.customDayName}, ${CUSTOM_MONTHS[currentMonth]} ${selectedDate.day}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="event-note">Event Note</Label>
                <Textarea
                  id="event-note"
                  placeholder="Enter event details..."
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  className="w-full"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEventDialogOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEvent} disabled={saving || !eventNote.trim()}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingEvent ? "Update" : "Create")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default CustomCalendar;