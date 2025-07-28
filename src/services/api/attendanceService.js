import { toast } from "react-toastify";

class AttendanceService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll() {
    try {
      const params = {
        "fields": [
          {
            "field": {
              "Name": "Name"
            }
          },
          {
            "field": {
              "Name": "studentId_c"
            }
          },
          {
            "field": {
              "Name": "date_c"
            }
          },
          {
            "field": {
              "Name": "status_c"
            }
          },
          {
            "field": {
              "Name": "notes_c"
            }
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('attendance_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching attendance records:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to load attendance records");
      }
      return [];
    }
  }

  async getById(recordId) {
    try {
      const tableFields = [
        {
          "field": {
            "Name": "Name"
          }
        },
        {
          "field": {
            "Name": "studentId_c"
          }
        },
        {
          "field": {
            "Name": "date_c"
          }
        },
        {
          "field": {
            "Name": "status_c"
          }
        },
        {
          "field": {
            "Name": "notes_c"
          }
        }
      ];
      
      const params = {
        fields: tableFields
      };
      
      const response = await this.apperClient.getRecordById('attendance_c', recordId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching attendance record with ID ${recordId}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }
}

export default new AttendanceService();