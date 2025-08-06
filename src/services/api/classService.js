import { toast } from "react-toastify";

class ClassService {
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
              "Name": "subject_c"
            }
          },
          {
            "field": {
              "Name": "room_c"
            }
          },
          {
            "field": {
              "Name": "schedule_c"
            }
          },
          {
            "field": {
              "Name": "teacherId_c"
            }
          }
        ]
      };
      
      const response = await this.apperClient.fetchRecords('class_c', params);
      
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
        console.error("Error fetching classes:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to load classes");
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
            "Name": "subject_c"
          }
        },
        {
          "field": {
            "Name": "room_c"
          }
        },
        {
          "field": {
            "Name": "schedule_c"
          }
        },
        {
          "field": {
            "Name": "teacherId_c"
          }
        }
      ];
      
      const params = {
        fields: tableFields
      };
      
      const response = await this.apperClient.getRecordById('class_c', recordId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching class record with ID ${recordId}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
return null;
    }
  }

  async create(classData) {
    try {
      const params = {
        records: [
          {
            Name: classData.name,
            subject_c: classData.subject,
            room_c: classData.room,
            schedule_c: classData.schedule
          }
        ]
      };
      
      const response = await this.apperClient.createRecord('class_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create class ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.map(result => result.data);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating class record:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to create class");
      }
    }
  }

  async update(recordId, classData) {
    try {
      const params = {
        records: [
          {
            Id: recordId,
            Name: classData.name,
            subject_c: classData.subject,
            room_c: classData.room,
            schedule_c: classData.schedule
          }
        ]
      };
      
      const response = await this.apperClient.updateRecord('class_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update class ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating class record:", error?.response?.data?.message);
        toast.error(error?.response?.data?.message);
      } else {
        console.error(error.message);
        toast.error("Failed to update class");
      }
    }
  }
}

const classService = new ClassService();
export default classService;