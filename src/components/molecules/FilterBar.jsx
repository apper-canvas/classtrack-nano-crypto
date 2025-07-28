import React from "react";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";

const FilterBar = ({ 
  classFilter, 
  onClassFilterChange, 
  statusFilter, 
  onStatusFilterChange,
  onClear,
  classes = [] 
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <Select
          label="Filter by Class"
          value={classFilter}
          onChange={(e) => onClassFilterChange(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map(cls => (
            <option key={cls.Id} value={cls.Id}>{cls.name}</option>
          ))}
        </Select>
      </div>
      
      <div className="flex-1 min-w-[200px]">
        <Select
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>
      
      <Button variant="outline" onClick={onClear}>
        Clear Filters
      </Button>
    </div>
  );
};

export default FilterBar;