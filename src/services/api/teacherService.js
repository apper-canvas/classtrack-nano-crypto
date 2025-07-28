class TeacherService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'teacher_c';
    
    // Identify lookup fields for proper handling
    this.lookupFields = ['Owner']; // Fields that return objects with Id/Name
  }

  async getAll(params = {}) {
    try {
      const requestParams = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Email_c" } },
          { field: { Name: "Subject_c" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: params.limit || 20,
          offset: params.offset || 0
        }
      };

      // Add search filter if provided
      if (params.search) {
        requestParams.where = [
          {
            FieldName: "Name",
            Operator: "Contains",
            Values: [params.search],
            Include: true
          }
        ];
      }

      // Add subject filter if provided
      if (params.subject) {
        const subjectFilter = {
          FieldName: "Subject_c",
          Operator: "Contains",
          Values: [params.subject],
          Include: true
        };
        
        if (requestParams.where) {
          requestParams.where.push(subjectFilter);
        } else {
          requestParams.where = [subjectFilter];
        }
      }

      const response = await this.apperClient.fetchRecords(this.tableName, requestParams);
      
      if (!response.success) {
        console.error(`Error fetching teachers: ${response.message}`);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching teachers:", error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error fetching teachers:", error.message);
        throw error;
      }
    }
  }

  async getById(teacherId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Email_c" } },
          { field: { Name: "Subject_c" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, teacherId, params);
      
      if (!response.success) {
        console.error(`Error fetching teacher with ID ${teacherId}: ${response.message}`);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching teacher with ID ${teacherId}:`, error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error(`Error fetching teacher with ID ${teacherId}:`, error.message);
        throw error;
      }
    }
  }

  async create(teacherData) {
    try {
      // Only include updateable fields
      const updateableData = {
        Name: teacherData.Name,
        Email_c: teacherData.Email_c,
        Subject_c: teacherData.Subject_c,
        Tags: teacherData.Tags || "",
        Owner: parseInt(teacherData.Owner) || null
      };

      // Remove null/undefined values
      Object.keys(updateableData).forEach(key => {
        if (updateableData[key] === null || updateableData[key] === undefined) {
          delete updateableData[key];
        }
      });

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error creating teacher: ${response.message}`);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} teacher records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords.map(result => result.data);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating teacher:", error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error creating teacher:", error.message);
        throw error;
      }
    }
  }

  async update(teacherId, teacherData) {
    try {
      // Only include updateable fields
      const updateableData = {
        Id: parseInt(teacherId),
        Name: teacherData.Name,
        Email_c: teacherData.Email_c,
        Subject_c: teacherData.Subject_c,
        Tags: teacherData.Tags || "",
        Owner: parseInt(teacherData.Owner) || null
      };

      // Remove null/undefined values (except Id)
      Object.keys(updateableData).forEach(key => {
        if (key !== 'Id' && (updateableData[key] === null || updateableData[key] === undefined)) {
          delete updateableData[key];
        }
      });

      const params = {
        records: [updateableData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error updating teacher: ${response.message}`);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} teacher records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating teacher:", error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error updating teacher:", error.message);
        throw error;
      }
    }
  }

  async delete(teacherIds) {
    try {
      const params = {
        RecordIds: Array.isArray(teacherIds) ? teacherIds : [teacherIds]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error deleting teachers: ${response.message}`);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} teacher records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length === params.RecordIds.length;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting teachers:", error.response.data.message);
        throw new Error(error.response.data.message);
      } else {
        console.error("Error deleting teachers:", error.message);
        throw error;
      }
    }
  }
}

export default new TeacherService();