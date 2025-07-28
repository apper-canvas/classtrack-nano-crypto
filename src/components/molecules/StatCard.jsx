import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const StatCard = ({ title, value, icon, trend, trendValue, color = "primary" }) => {
  const colorClasses = {
    primary: "from-primary-500 to-primary-600",
    secondary: "from-secondary-500 to-secondary-600",
    success: "from-green-500 to-green-600",
    warning: "from-yellow-500 to-yellow-600",
    error: "from-red-500 to-red-600",
    info: "from-blue-500 to-blue-600"
  };

  const iconBgClasses = {
    primary: "from-primary-100 to-primary-200",
    secondary: "from-secondary-100 to-secondary-200",
    success: "from-green-100 to-green-200",
    warning: "from-yellow-100 to-yellow-200",
    error: "from-red-100 to-red-200",
    info: "from-blue-100 to-blue-200"
  };

  return (
    <Card className="p-6 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                className={`w-4 h-4 mr-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`}
              />
              <span className={`text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-br ${iconBgClasses[color]}`}>
          <ApperIcon name={icon} className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;