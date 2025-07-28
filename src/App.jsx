import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Layout Components
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";

// Page Components
import Dashboard from "@/components/pages/Dashboard";
import Students from "@/components/pages/Students";
import Classes from "@/components/pages/Classes";
import Grades from "@/components/pages/Grades";
import Attendance from "@/components/pages/Attendance";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        
        <div className="lg:pl-64">
          <Header
            onMenuClick={handleMenuClick}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            title="ClassTrack"
          />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="/attendance" element={<Attendance />} />
            </Routes>
          </main>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </Router>
  );
}

export default App;