import React from "react";

const Loading = ({ type = "card" }) => {
  if (type === "table") {
    return (
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="space-y-4">
          {/* Table header skeleton */}
          <div className="flex space-x-4">
            <div className="skeleton h-4 w-24 rounded"></div>
            <div className="skeleton h-4 w-32 rounded"></div>
            <div className="skeleton h-4 w-20 rounded"></div>
            <div className="skeleton h-4 w-16 rounded"></div>
          </div>
          
          {/* Table rows skeleton */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex space-x-4 py-3 border-b border-gray-100">
              <div className="skeleton h-4 w-28 rounded"></div>
              <div className="skeleton h-4 w-36 rounded"></div>
              <div className="skeleton h-4 w-24 rounded"></div>
              <div className="skeleton h-4 w-20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "stats") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-card p-6">
            <div className="space-y-3">
              <div className="skeleton h-4 w-20 rounded"></div>
              <div className="skeleton h-8 w-16 rounded"></div>
              <div className="skeleton h-3 w-24 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="space-y-6">
          <div className="skeleton h-6 w-32 rounded"></div>
          
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-4 w-20 rounded"></div>
              <div className="skeleton h-10 w-full rounded-md"></div>
            </div>
          ))}
          
          <div className="flex space-x-3 pt-4">
            <div className="skeleton h-10 w-20 rounded-md"></div>
            <div className="skeleton h-10 w-16 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-card p-6">
          <div className="space-y-4">
            <div className="skeleton h-6 w-3/4 rounded"></div>
            <div className="skeleton h-4 w-full rounded"></div>
            <div className="skeleton h-4 w-2/3 rounded"></div>
            <div className="flex space-x-2 mt-4">
              <div className="skeleton h-8 w-16 rounded-full"></div>
              <div className="skeleton h-8 w-20 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loading;