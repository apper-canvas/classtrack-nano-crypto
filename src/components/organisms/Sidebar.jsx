import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Students", href: "/students", icon: "Users" },
    { name: "Teachers", href: "/teachers", icon: "UserCheck" },
    { name: "Classes", href: "/classes", icon: "BookOpen" },
    { name: "Grades", href: "/grades", icon: "FileText" },
    { name: "Attendance", href: "/attendance", icon: "CheckSquare" },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <NavLink
        to={item.href}
        onClick={onClose}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
            : "text-gray-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700"
        }`}
      >
        <ApperIcon name={item.icon} className="w-5 h-5 mr-3" />
        {item.name}
      </NavLink>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-2 mr-3">
              <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                ClassTrack
              </h1>
              <p className="text-sm text-gray-500">Student Management</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={onClose}
              >
                <ApperIcon name="X" className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-8">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-2 mr-3">
                    <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                      ClassTrack
                    </h1>
                    <p className="text-sm text-gray-500">Student Management</p>
                  </div>
                </div>
              </div>
              
              <nav className="px-4 space-y-2">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;