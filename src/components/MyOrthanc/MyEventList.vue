<template>
  <div>
    <table class="event-table table table-sm">
      <thead>
        <!-- Select All Checkbox in the search row -->
        <tr class="event-table-headers">
          <th>
            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" :indeterminate="isIndeterminate" />
          </th>
          <th v-for="field in fields" :key="field.fieldName" :style="{ width: field.width }">
            {{ $t('my_event_queue_tags.' + field.fieldName) }}
          </th>
        </tr>
        <!-- Filters row -->
        <tr class="event-table-filters">
          <th>
            <button @click="clearFilters" class="clear-filters-btn">
              <!-- Clear Filters -->
              <i class="bi bi-x-circle"></i>
            </button>
          </th>
          <th v-for="field in fields" :key="field.fieldName">
            <input v-model="filters[fieldMappings[field.fieldName]]" :placeholder="field.placeholder"
              @keyup.enter="search" />
          </th>
        </tr>
        <!-- Operations row -->
        <tr class="event-table-operations">
          <td class="selected-count" :colspan="1">
            <div>
              <p><strong>{{ $t('my_event_queue_tags.count') }}</strong></p>
              <p>{{ selectedEvents ? selectedEvents.length : 0 }}</p>
            </div>
          </td>
          <td :colspan="fields.length" class="operation-buttons">
            <!-- Add your operation buttons here -->
            <button :title="$t('my_event_queue_tags.reload')" @click="fetchData('notify')" class="buttons bi bi-arrow-clockwise"></button>
            <button :title="$t('my_event_queue_tags.reset')" @click="handleResetSelectedEvents('many')"
              :disabled="selectedEvents.length === 0" class="buttons bi bi-arrow-repeat"></button>
            <button :title="$t('my_event_queue_tags.delete')" @click="handleDeleteSelectedEvents('many')"
              :disabled="selectedEvents.length === 0" class="buttons bi bi-trash"></button>
            <MyNotification :notification="this.notification" />
          </td>
        </tr>
      </thead>
      <tbody>
        <template v-for="row in filteredData" :key="row.id">
          <!-- Main Row -->
          <tr :class="'event-table-row ' + (showEventsDetails.includes(row.id) ? 'show-event-details' : '')"
            @click="setShowEventDetails(row.id)">
            <td>
              <input type="checkbox" v-model="selectedEvents" :value="row.id" @click.stop />
            </td>
            <td v-for="field in fields" :key="field.fieldName" :title="row[fieldMappings[field.fieldName]]">
              {{ field.fieldName.includes("Time") ? formatTimestamp(row[fieldMappings[field.fieldName]]) :
                row[fieldMappings[field.fieldName]] }}
            </td>
          </tr>

          <!-- Detail Row -->
          <tr v-if="showEventsDetails.includes(row.id)">
            <td :colspan="fields.length + 1" class="event-detail-row">
              <MyEventDetail :eventDetails="row" :handleDeleteEvent="handleDeleteSelectedEvents"
                :handleResetEvent="handleResetSelectedEvents" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    <MyConfirmModal v-if="showConfirmModal"
      :events="(actionType == 'many' ? this.selectedEvents : JSON.parse(actionType))" :action="this.action"
      :confirmText="this.confirmText" :cancelText="this.cancelText" :closeModal="this.handleCloseModal"
      :fetchData="this.fetchData" :deselectAll="this.handleDeselectAll" :notify="this.notify" :t="this.$t" />
  </div>
</template>

<script>
import MyConfirmModal from "./MyConfirmModal.vue";
import MyEventDetail from "./MyEventDetail.vue";
import MyNotification from "./MyNotification.vue";
import myApi from "./configs/myApi";

export default {
  components: {
    MyEventDetail,
    MyConfirmModal,
    MyNotification,
  },
  data() {
    return {
      fields: [
        { fieldName: "id", width: "5%", placeholder: "1234", isOrderable: true },
        { fieldName: "app_id", width: "5%", placeholder: "ABCD1234", isOrderable: false },
        { fieldName: "creation_time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true },
        { fieldName: "last_updated_time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true },
        { fieldName: "iuid", width: "13%", placeholder: "1.23.456", isOrderable: false },
        { fieldName: "resource_id", width: "13%", placeholder: "abcd-1234", isOrderable: false },
        { fieldName: "resource_type", width: "5%", placeholder: "Study", isOrderable: false },
        { fieldName: "delay_sec", width: "4%", placeholder: "1234", isOrderable: true },
        { fieldName: "retry", width: "3%", placeholder: "1234", isOrderable: true },
      ],
      fieldMappings: {
        "id": "id",
        "app_id": "app_id",
        "creation_time": "creationTime",
        "delay_sec": "delaySec",
        "iuid": "iuid",
        "last_updated_time": "lastUpdatedTime",
        "resource_id": "resourceId",
        "resource_type": "resourceType",
        "retry": "retry",
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
      selectedEvents: [], // Stores selected event IDs
      selectAll: false, // Flag to control the "Select All" checkbox
      showEventsDetails: [],
      showConfirmModal: false,
      confirmText: this.$t('my_event_queue_tags.confirm'),
      cancelText: this.$t('my_event_queue_tags.cancel'),
      actionType: "",
      action: "",
      notification: {
        message: '',
        type: 'success',
      },
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData(option) {
      try {
        const response = await myApi.getEventQueues();
        this.data = response.events || response;
        this.filteredData = this.data;
        if (option === "notify") {
          this.notify({
            message: this.$t('my_event_queue_tags.reload') + " " + this.$t('my_event_queue_tags.success'),
            type: 'success'
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (option === "notify") {
          this.notify({
            message: `Failed to load event queue: ${error.message}`,
            type: 'error'
          });
        }
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
    setShowEventDetails(eventId) {
      const check = this.showEventsDetails.some(id => id === eventId);
      // console.log("check", check);
      // console.log("eventId", eventId);
      // console.log("showEventsDetails", this.showEventsDetails);
      if (check) {
        this.showEventsDetails.splice(this.showEventsDetails.findIndex(id => id === eventId), 1); // Remove eventId from the array
      } else {
        this.showEventsDetails.push(eventId); // Add eventId to the array
      }
    },
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedEvents = this.filteredData.map(row => row.id);
      } else {
        this.selectedEvents = [];
      }
    },
    handleOpenModal() {
      this.showConfirmModal = true;
    },
    handleCloseModal() {
      this.action = "";
      this.actionType = "";
      this.showConfirmModal = false;
    },
    handleDeleteSelectedEvents(src) {
      this.actionType = src;
      this.action = "delete";
      this.handleOpenModal();
    },
    handleResetSelectedEvents(src) {
      this.actionType = src;
      this.action = "reset";
      this.handleOpenModal();
    },
    handleDeselectAll() {
      this.selectedEvents = [];
      this.selectAll = false;
    },
    clearFilters() {
      // Clear all filters
      Object.keys(this.filters).forEach(key => {
        this.filters[key] = '';
      });
      this.search(); // Re-filter data with cleared filters
    },
    notify(message, type) {
      this.notification.message = '';
      // Small delay to re-trigger the watch
      this.$nextTick(() => {
        this.notification = { message, type };
      });
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
    selectedEvents() {
      this.selectAll = this.selectedEvents.length === this.filteredData.length;
    }
  },
  computed: {
    isIndeterminate() {
      return this.selectedEvents.length > 0 && this.selectedEvents.length < this.filteredData.length;
    }
  }
};
</script>

<style scoped>
/* General table styles */
.event-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  table-layout: fixed;
  /* Ensures fixed column width */
}

.event-table th {
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

.event-table td {
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

.event-table th {
  background-color: #bebebe;
  /* Darker gray for header */
  font-weight: bold;
  font-size: 14px;
}

.event-table-filters input {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  background-color: #fafafa;
}

.event-table-filters input:focus {
  outline: none;
  border-color: #007bff;
}

/* Odd rows background color */
.event-table>tbody>tr:nth-child(odd)>td {
  background-color: var(--study-odd-bg-color);
  /* Custom variable for odd row color */
}

/* Even rows background color */
.event-table>tbody>tr:nth-child(even)>td {
  background-color: var(--study-even-bg-color);
  /* Custom variable for even row color */
}

/* Prevent hover effect on the first row of tbody (header row) */
.event-table>tbody>.event-table-row:hover>* {
  background-color: var(--study-hover-color);
  /* Custom variable for hover color */
}

/* Add styling for the first checkbox column */
.event-table th:first-child,
.event-table td:first-child {
  width: 5%;
  /* Adjust the width of the checkbox column */
  text-align: center;
}

/* Style for operation buttons */
button {
  margin-right: 10px;
  padding: 12px 17px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}

button:hover {
  background-color: #006adb;
}

button:active {
  background-color: #005ec2;
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
  margin-left: auto;
  margin-right: auto;
  ;
}

.clear-filters-btn:hover {
  background-color: #d5d5d5;
}

.clear-filters-btn:active {
  background-color: #c6c6c6;
}

/* Responsive design */
@media (max-width: 768px) {

  .event-table th,
  .event-table td {
    font-size: 12px;
    padding: 6px;
  }

  .event-table {
    width: 100%;
    font-size: 12px;
  }

  .event-table-filters input {
    padding: 4px;
  }
}

/* Add focus effect for input fields */
.event-table-filters input:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

.event-table-headers th {
  background-color: #fff !important;
}

.event-table .show-event-details>td {
  background-color: var(--study-selected-color) !important;
  border-top: 3px solid black !important;
}

.event-table .show-event-details:hover>td {
  background-color: #dadada !important;
  border-top: 3px solid black !important;
}

.event-table .hide-event-detail {
  display: none;
}

.event-table .show-event-detail {
  display: block;
  background-color: #f9f9f9;
  padding: 10px;
  border: 1px solid #ddd;
  margin-top: 5px;
  border-radius: 4px;
}

.event-table .event-detail-row {
  background-color: var(--study-selected-color) !important;
  border-bottom: 3px solid black !important;
}

.selected-count>div>p {
  margin: 0;
  padding: 0;
}

.operation-buttons {
  vertical-align: middle;
  padding: 0;
}

table {
  border-collapse: separate;
  border-spacing: 0;
}

thead {
  position: sticky;
  top: 0;
  z-index: 1;
  box-shadow: inset 0 -1px 0 #ccc;
  border-bottom: 2px solid #b8b6b6;
}
</style>
