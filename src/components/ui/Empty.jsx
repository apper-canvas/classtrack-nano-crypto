import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item.",
  actionText = "Add New",
  onAction,
  icon = "Database"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-full p-6 mb-6">
        <ApperIcon 
          name={icon} 
          className="w-16 h-16 text-primary-500" 
        />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {title}
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md">
        {description}
      </p>
      
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ApperIcon name="Plus" className="w-5 h-5 mr-2" />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default Empty;