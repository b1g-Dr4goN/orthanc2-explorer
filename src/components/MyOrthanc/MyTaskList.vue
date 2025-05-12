<template>
  <div>
    <table class="task-table table table-sm">
      <thead>
        <!-- Select All Checkbox in the search row -->
        <tr class="task-table-headers">
          <th>
            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" :indeterminate="isIndeterminate" />
          </th>
          <th v-for="field in fields" :key="field.fieldName" :style="{ width: field.width }">
            {{ field.fieldName }}
          </th>
        </tr>
        <!-- Filters row -->
        <tr class="task-table-filters">
          <th>
            <button @click="clearFilters" class="clear-filters-btn">
              X <!-- Clear Filters -->
            </button>
          </th>
          <th v-for="field in fields" :key="field.fieldName">
            <input v-model="filters[fieldMappings[field.fieldName]]" :placeholder="field.placeholder"
              @keyup.enter="search" />
          </th>
        </tr>
        <!-- Operations row -->
        <tr>
          <td :colspan="fields.length + 1">
            <!-- Add your operation buttons here -->
            <button title="Reset Event Queues" @click="resetSelectedTasks" :disabled="selectedTasks.length === 0"
              class="buttons bi bi-arrow-clockwise"></button>
            <button title="Delete Event Queues" @click="deleteSelectedTasks" :disabled="selectedTasks.length === 0"
              class="buttons bi bi-trash"></button>
          </td>
        </tr>
      </thead>
      <tbody>
        <template v-for="row in filteredData" :key="row.id">
          <!-- Main Row -->
          <tr :class="'task-table-row ' + (showTasksDetails.includes(row.id) ? 'show-task-details' : '')"
            @click="setShowTaskDetails(row.id)">
            <td>
              <input type="checkbox" v-model="selectedTasks" :value="row.id" @click.stop />
            </td>
            <td v-for="field in fields" :key="field.fieldName" :title="row[fieldMappings[field.fieldName]]">
              {{ field.fieldName.includes("Time") ? formatTimestamp(row[fieldMappings[field.fieldName]]) : row[fieldMappings[field.fieldName]] }}
            </td>
          </tr>

          <!-- Detail Row -->
          <tr v-if="showTasksDetails.includes(row.id)">
            <td :colspan="fields.length + 1" class="task-detail-row">
              <MyTaskDetail :taskDetails="row" :fetchData="this.fetchData" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
import MyTaskDetail from "./MyTaskDetail.vue";
import myApi from "./myApi";

export default {
  components: {
    MyTaskDetail,
  },
  data() {
    return {
      fields: [
        { fieldName: "ID", width: "5%", placeholder: "1234", isOrderable: true },
        { fieldName: "App ID", width: "5%", placeholder: "ABCD1234", isOrderable: false },
        { fieldName: "Creation Time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true },
        { fieldName: "Last Updated Time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true },
        { fieldName: "IUID", width: "13%", placeholder: "1.23.456", isOrderable: false },
        { fieldName: "Resource ID", width: "13%", placeholder: "abcd-1234", isOrderable: false },
        { fieldName: "Resource Type", width: "5%", placeholder: "Study", isOrderable: false },
        { fieldName: "Delay Sec", width: "4%", placeholder: "1234", isOrderable: true },
        { fieldName: "Retry", width: "3%", placeholder: "1234", isOrderable: true },
      ],
      fieldMappings: {
        "ID": "id",
        "App ID": "app_id",
        "Creation Time": "creation_time",
        "Delay Sec": "delay_sec",
        "IUID": "iuid",
        "Last Updated Time": "last_updated_time",
        "Resource ID": "resource_id",
        "Resource Type": "resource_type",
        "Retry": "retry",
      },
      filters: {
        app_id: '',
        creation_time: '',
        delay_sec: '',
        id: '',
        iuid: '',
        last_updated_time: '',
        now: '',
        resource_id: '',
        resource_type: '',
        retry: ''
      },
      data: [], // Replace with actual data fetching logic
      filteredData: [],
      selectedTasks: [], // Stores selected task IDs
      selectAll: false, // Flag to control the "Select All" checkbox
      showTasksDetails: [],
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        const response = await myApi.getEventQueues();
        this.data = response.events || response;
        this.filteredData = this.data;
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    },
    search() {
      this.filteredData = this.data.filter(row => {
        return Object.keys(this.filters).every(key => {
          if (!this.filters[key]) return true;
          const fieldValue = row[key];
          return fieldValue && fieldValue.toString().toLowerCase().includes(this.filters[key].toLowerCase());
        });
      });
    },
    setShowTaskDetails(taskId) {
      const check = this.showTasksDetails.some(id => id === taskId);
      // console.log("check", check);
      // console.log("taskId", taskId);
      // console.log("showTasksDetails", this.showTasksDetails);
      if (check) {
        this.showTasksDetails.splice(this.showTasksDetails.findIndex(id => id === taskId), 1); // Remove taskId from the array
      } else {
        this.showTasksDetails.push(taskId); // Add taskId to the array
      }
    },
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedTasks = this.filteredData.map(row => row.id);
      } else {
        this.selectedTasks = [];
      }
    },
    async resetSelectedTasks() {
      // Handle reset logic
      try {
        const response = await myApi.resetEventQueues(this.selectedTasks);
        this.selectedTasks = [];
        this.fetchData();
      } catch (err) {
        console.error("Failed to reset event queues: ", err);
      }
    },
    async deleteSelectedTasks() {
      // Handle deletion logic
      try {
        const response = await myApi.deleteEventQueues(this.selectedTasks);
        this.selectedTasks = [];
        this.fetchData();
      } catch (err) {
        console.error("Failed to delete event queues: ", err);
      }
    },
    importTask() {
      // Handle import logic here
      console.log("Importing task");
    },
    clearFilters() {
      // Clear all filters
      Object.keys(this.filters).forEach(key => {
        this.filters[key] = '';
      });
      this.search(); // Re-filter data with cleared filters
    },
    formatTimestamp(timestamp) {
      // Check if timestamp exists and is a valid length (14 chars)
      if (timestamp && timestamp.length === 15) {
        const year = timestamp.slice(0, 4);
        const month = timestamp.slice(4, 6);
        const day = timestamp.slice(6, 8);
        const hour = timestamp.slice(9, 11);
        const minute = timestamp.slice(11, 13);
        const second = timestamp.slice(13, 15);

        // Return the formatted date in DD/MM/YYYY - HH:MM:SS format
        return `${day}/${month}/${year} - ${hour}:${minute}:${second}`;
      }
      return ''; // Return an empty string if timestamp is invalid
    },
  },
  watch: {
    filters: {
      handler() {
        this.search();
      },
      deep: true
    },
    selectedTasks() {
      this.selectAll = this.selectedTasks.length === this.filteredData.length;
    }
  },
  computed: {
    isIndeterminate() {
      return this.selectedTasks.length > 0 && this.selectedTasks.length < this.filteredData.length;
    }
  }
};
</script>

<style scoped>
/* General table styles */
.task-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  table-layout: fixed;
  /* Ensures fixed column width */
}

.task-table th {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  background-color: #bebebe;
  /* Changed to gray for header */
  font-weight: bold;
  white-space: normal;
  /* Allow text to wrap in header */
  word-wrap: break-word;
  /* Ensure long words break if necessary */
}

.task-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  white-space: nowrap;
  /* Prevent text from wrapping in cell */
  overflow: hidden;
  /* Hide overflowed content */
  text-overflow: ellipsis;
  /* Show ellipsis for overflowed text */
  max-width: 200px;
  /* Optional: adjust width as necessary */
}

.task-table th {
  background-color: #bebebe;
  /* Darker gray for header */
  font-weight: bold;
  font-size: 14px;
}

.task-table-filters input {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fafafa;
}

.task-table-filters input:focus {
  outline: none;
  border-color: #007bff;
}

/* Odd rows background color */
.task-table>tbody>tr:nth-child(odd)>td {
  background-color: var(--study-odd-bg-color);
  /* Custom variable for odd row color */
}

/* Even rows background color */
.task-table>tbody>tr:nth-child(even)>td {
  background-color: var(--study-even-bg-color);
  /* Custom variable for even row color */
}

/* Prevent hover effect on the first row of tbody (header row) */
.task-table>tbody>.task-table-row:hover>* {
  background-color: var(--study-hover-color);
  /* Custom variable for hover color */
}

/* Add styling for the first checkbox column */
.task-table th:first-child,
.task-table td:first-child {
  width: 5%;
  /* Adjust the width of the checkbox column */
  text-align: center;
}

/* Style for operation buttons */
button {
  margin-right: 10px;
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}

button:disabled {
  background-color: #ccc;
}

/* Style for the "Clear Filters" button */
.clear-filters-btn {
  background-color: #fff;
  color: black;
  border: none;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
}

.clear-filters-btn:hover {
  background-color: #d5d5d5;
}

.clear-filters-btn:active {
  background-color: #c6c6c6;
}

/* Responsive design */
@media (max-width: 768px) {

  .task-table th,
  .task-table td {
    font-size: 12px;
    padding: 6px;
  }

  .task-table {
    width: 100%;
    font-size: 12px;
  }

  .task-table-filters input {
    padding: 4px;
  }
}

/* Add focus effect for input fields */
.task-table-filters input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.task-table-headers th {
  background-color: #fff !important;
}

.task-table .show-task-details>td {
  background-color: var(--study-selected-color) !important;
  border-top: 3px solid black !important;
}

.task-table .show-task-details:hover>td {
  background-color: #dadada !important;
  border-top: 3px solid black !important;
}

.task-table .hide-task-detail {
  display: none;
}

.task-table .show-task-detail {
  display: block;
  background-color: #f9f9f9;
  padding: 10px;
  border: 1px solid #ddd;
  margin-top: 5px;
  border-radius: 4px;
}

.task-table .task-detail-row {
  background-color: var(--study-selected-color) !important;
  border-bottom: 3px solid black !important;
}
</style>
