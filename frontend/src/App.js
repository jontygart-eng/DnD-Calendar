import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomCalendar from "./components/CustomCalendar";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomCalendar />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;