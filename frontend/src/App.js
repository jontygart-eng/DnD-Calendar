import React, { Suspense } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Check if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';

// Lazy load components
const CustomCalendar = React.lazy(() => import("./components/CustomCalendar"));
const StaticCustomCalendar = React.lazy(() => import("./components/StaticCustomCalendar"));

// Minimal loading component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    background: '#f8fafc'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      border: '3px solid #e2e8f0',
      borderTop: '3px solid #6366f1',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }}></div>
  </div>
);

function App() {
  // Use static version for production (GitHub Pages), full version for development
  const CalendarComponent = isDevelopment ? CustomCalendar : StaticCustomCalendar;

  return (
    <div className="App">
      <BrowserRouter basename={process.env.PUBLIC_URL || ""}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<CalendarComponent />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;