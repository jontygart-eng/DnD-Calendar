import React, { Suspense } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load the main calendar component for faster initial load
const CustomCalendar = React.lazy(() => import("./components/CustomCalendar"));

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
  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<CustomCalendar />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;