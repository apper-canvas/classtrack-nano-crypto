import React from "react";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick, searchValue, onSearchChange, title = "Dashboard" }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:pl-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              leftIcon="Menu"
            >
            </Button>
          </div>

          {/* Title */}
          <div className="flex-1 lg:flex-none">
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              {title}
            </h1>
          </div>

          {/* Search and actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <SearchBar
                value={searchValue}
                onChange={onSearchChange}
                placeholder="Search students, classes..."
                className="w-80"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <ApperIcon name="Bell" className="w-5 h-5" />
              </Button>
              
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search students, classes..."
          />
        </div>
      </div>
    </header>
  );
};

export default Header;