// Mock data for custom calendar system
export const CUSTOM_DAYS = [
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
];

export const CUSTOM_MONTHS = [
  'Revan',
  'Juno', 
  'Justin Thyme',
  'Plato',
  'Olivia Newton John',
  'Palmetto',
  'Juice Daddy',
  'Retrograde',
  'Blizzrock',
  'Challenger'
];

// Mock calendar data - each month has 35 days (5 weeks of 10-day cycles)
export const DAYS_PER_MONTH = 35;

// Mock current date in custom calendar
export const mockCurrentCustomDate = {
  month: 2, // Justin Thyme (0-indexed)
  day: 18,   // Day 18 of the month
  year: 2025
};

// Mock events/tracking data
export const mockEvents = {
  '2025-2-15': { note: 'Important meeting', type: 'event' },
  '2025-2-18': { note: 'Today!', type: 'today' },
  '2025-2-22': { note: 'Birthday celebration', type: 'special' },
  '2025-3-5': { note: 'Project deadline', type: 'deadline' }
};

// Utility function to convert day number to custom day name
export const getCustomDayName = (dayNumber) => {
  return CUSTOM_DAYS[dayNumber % 10];
};

// Utility function to get days in a month (all months have 35 days in this system)
export const getDaysInMonth = () => DAYS_PER_MONTH;

// Convert standard date to custom calendar (mock implementation)
export const convertToCustomDate = (standardDate = new Date()) => {
  // Simple mock conversion - in reality this would be more complex
  const dayOfYear = Math.floor((standardDate - new Date(standardDate.getFullYear(), 0, 1)) / 86400000);
  const customMonth = Math.floor(dayOfYear / DAYS_PER_MONTH) % CUSTOM_MONTHS.length;
  const customDay = (dayOfYear % DAYS_PER_MONTH) + 1;
  
  return {
    month: customMonth,
    day: customDay,
    year: standardDate.getFullYear()
  };
};