<template>
  <div>
    <table class="event-table table table-sm">
      <thead>
        <tr class="event-table-headers">
          <th />
          <th v-for="field in fields" :key="field.fieldName" :style="{ width: field.width }">
            {{ $t('my_event_queue_tags.' + field.fieldName) }}
          </th>
        </tr>
        <tr class="event-table-filters">
          <th>
            <button @click="clearFilters" class="clear-filters-btn">
              <i class="bi bi-x-circle"></i>
            </button>
          </th>
          <th v-for="field in fields" :key="field.fieldName">
            <input v-if="field.isSearchable" v-model="filters[fieldMappings[field.fieldName]]"
              :placeholder="field.placeholder" @keyup.enter="search" />
          </th>
        </tr>
        <tr class="event-table-operations">
          <td :colspan="1">
            <input id="select-all" type="checkbox" v-model="selectAll" @change="toggleSelectAll" :indeterminate="isIndeterminate" />
          </td>
          <td :colspan="fields.length" class="operation-buttons">
            <button :title="$t('my_event_queue_tags.reload')" @click="fetchData('notify')"
              class="buttons bi bi-arrow-clockwise"></button>
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
          <tr v-if="row.id"
            :class="'event-table-row ' + (showEventsDetails.includes(row.id) ? 'show-event-details' : '')"
            @click="setShowEventDetails(row.id)">
            <td>
              <input type="checkbox" v-model="selectedEvents" :value="row.id" @click.stop />
            </td>
            <td v-for="field in fields" :key="field.fieldName" :title="row[fieldMappings[field.fieldName]]">
              {{ row[fieldMappings[field.fieldName]] }}
            </td>
          </tr>

          <!-- Detail Row -->
          <tr v-if="showEventsDetails.includes(row.id)">
            <td :colspan="fields.length + 1" class="event-detail-row">
              <MyEventDetail v-if="eventDetailsMap[row.id]" :eventDetails="eventDetailsMap[row.id]"
                :handleUpdateEvent="handleUpdateSelectedEvent" :handleDeleteEvent="handleDeleteSelectedEvents"
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
        { fieldName: "id", width: "5%", placeholder: "1234", isOrderable: true, isSearchable: false },
        { fieldName: "app_id", width: "5%", placeholder: "ABCD1234", isOrderable: false, isSearchable: true },
        { fieldName: "creation_time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true, isSearchable: false },
        { fieldName: "last_updated_time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true, isSearchable: false },
        { fieldName: "iuid", width: "13%", placeholder: "1.23.456", isOrderable: false, isSearchable: false },
        { fieldName: "resource_id", width: "13%", placeholder: "abcd-1234", isOrderable: false, isSearchable: false },
        { fieldName: "resource_type", width: "5%", placeholder: "Study", isOrderable: false, isSearchable: true },
        { fieldName: "delay_sec", width: "4%", placeholder: "1234", isOrderable: true, isSearchable: false },
        { fieldName: "retry", width: "3%", placeholder: "1234", isOrderable: true, isSearchable: false },
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
      paramsMappings: {
        "id": "ID",
        "app_id": "AppID",
        "creationTime": "CreationTime",
        "delaySec": "DelaySec",
        "iuid": "IUID",
        "lastUpdatedTime": "LastUpdatedTime",
        "resourceId": "ResourceID",
        "resourceType": "ResourceType",
        "retry": "Retry",
      },
      filters: {
        app_id: '',
        creation_time: '',
        delay_sec: '',
        id: '',
        iuid: '',
        last_updated_time: '',
        resource_id: '',
        resource_type: '',
        retry: ''
      },
      data: [],
      filteredData: [],
      selectedEvents: [],
      selectAll: false,
      showEventsDetails: [],
      eventDetailsMap: {},
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
    async search() {
      try {
        const params = {};
        for (const key in this.filters) {
          if (this.filters[key]) {
            console.log(this.paramsMappings[key]);
            console.log(this.filters[key])
            params[this.paramsMappings[key]] = this.filters[key];
          }
        }
        const response = await myApi.getEventQueues(params);
        this.filteredData = response.events || response;
        this.notify({
          message: this.$t('my_event_queue_tags.search') + " " + this.$t('my_event_queue_tags.success'),
          type: 'success'
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        this.notify({
          message: `Failed to load event queue: ${error.message}`,
          type: 'error'
        });
      }
    },
    async setShowEventDetails(eventId) {
      const index = this.showEventsDetails.indexOf(eventId);

      if (index !== -1) {
        this.showEventsDetails.splice(index, 1);
      } else {
        this.showEventsDetails.push(eventId);

        if (!this.eventDetailsMap[eventId]) {
          try {
            const detail = await myApi.getEventQueue(eventId);
            this.eventDetailsMap[eventId] = detail[0];
          } catch (err) {
            console.error("Failed to fetch event detail:", err);
            this.notify({
              message: `Failed to load event #${eventId}: ${err.message}`,
              type: "error"
            });
          }
        }
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
    handleUpdateSelectedEvent(src) {
      this.actionType = src;
      this.action = "update";
      this.handleOpenModal();
    },
    handleDeselectAll() {
      this.selectedEvents = [];
      this.selectAll = false;
    },
    clearFilters() {
      Object.keys(this.filters).forEach(key => {
        this.filters[key] = '';
      });
      this.search();
    },
    notify(message, type) {
      this.notification.message = '';
      this.$nextTick(() => {
        this.notification = { message, type };
      });
    },
  },
  watch: {
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
.event-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  table-layout: fixed;
}

.event-table th {
  padding: 5px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  background-color: #bebebe;
  font-weight: bold;
  white-space: normal;
  word-wrap: break-word;
}

.event-table td {
  padding: 3px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.event-table th {
  background-color: var(--study-table-actions-bg-color);
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

.event-table-operations>td {
  background-color: var(--study-table-actions-bg-color);
}

.event-table>tbody>tr:nth-child(odd)>td {
  background-color: var(--study-odd-bg-color);
}

.event-table>tbody>tr:nth-child(even)>td {
  background-color: var(--study-even-bg-color);
}

.event-table>tbody>.event-table-row:hover>* {
  background-color: var(--study-hover-color);
}

.event-table th:first-child,
.event-table td:first-child {
  width: 5%;
  text-align: center;
}

button {
  margin-right: 10px;
  margin-bottom: 5px;
  padding: 4px 8px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
}

button:hover {
  background-color: #5c636a;
}

button:active {
  background-color: #565e64;
}

button:disabled {
  background-color: #a2a9af;
}

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
}
</style>
