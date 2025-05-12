<template>
    <div>
        <div class="task-detail-container">
            <div class="task-detail-header"><strong>Task #{{ taskDetails[fieldMappings["ID"]] }} Details</strong>
            </div>
            <div class="task-detail-content">
                <!-- Task Details Column -->
                <div class="task-detail-column task-details" style="width: 68%;">
                    <div class="task-detail-row" v-for="(field, i) in fields" :key="i">
                        <div class="task-detail-field">
                            <strong>{{ field.fieldName }}:&nbsp;</strong>
                            <div class="task-detail-label">
                                {{ field.fieldName.includes("Time") ?
                                    formatTimestamp(taskDetails[fieldMappings?.[field.fieldName]]) :
                                    taskDetails[fieldMappings[field.fieldName]] }}
                            </div>
                            <div>
                                <CopyToClipboardButton
                                    v-if="taskDetails[fieldMappings[field.fieldName]] && taskDetails[fieldMappings[field.fieldName]].toString().length > 0"
                                    :valueToCopy="taskDetails[fieldMappings[field.fieldName]]" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Operations Column (for buttons) -->
                <div class="task-detail-column operations" style="width: 32%;">
                    <div class="operations-content">
                        <!-- Here you can add buttons or any other task operations -->
                        <div class="operation-placeholder">
                            <strong>Operations</strong>
                            <!-- Placeholder for buttons or operations -->
                            <button title="Reset Event" @click="resetTask" class="buttons bi bi-arrow-clockwise"></button>
                            <button title="Delete Event" @click="deleteTask" class="buttons bi bi-trash"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CopyToClipboardButton from '../CopyToClipboardButton.vue';
import myApi from './myApi';

export default {
    components: {
        CopyToClipboardButton,
    },
    props: {
        taskDetails: {
            type: Object,
            required: true
        },
        fetchData: {
            type: Function,
            required: true,
        }
    },
    data() {
        return {
            fields: [
                { fieldName: "ID", width: "5%", placeholder: "1234", isOrderable: true },
                { fieldName: "App ID", width: "5%", placeholder: "ABCD1234", isOrderable: false },
                { fieldName: "App Type", width: "5%", placeholder: "StoreServer", isOrderable: false },
                { fieldName: "Creation Time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true },
                { fieldName: "Last Updated Time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true },
                { fieldName: "IUID", width: "13%", placeholder: "1.23.456", isOrderable: false },
                { fieldName: "Resource ID", width: "13%", placeholder: "abcd-1234", isOrderable: false },
                { fieldName: "Resource Type", width: "5%", placeholder: "Study", isOrderable: false },
                { fieldName: "Delay Sec", width: "4%", placeholder: "1234", isOrderable: true },
                { fieldName: "Retry", width: "3%", placeholder: "1234", isOrderable: true },
                { fieldName: "Failed Reason", width: "11%", placeholder: "ABCD1234", isOrderable: false },
            ],
            fieldMappings: {
                "App ID": "app_id",
                "App Type": "app_type",
                "Creation Time": "creation_time",
                "Delay Sec": "delay_sec",
                "Failed Reason": "failed_reason",
                "ID": "id",
                "IUID": "iuid",
                "Last Updated Time": "last_updated_time",
                "Resource ID": "resource_id",
                "Resource Type": "resource_type",
                "Retry": "retry",
            },
        };
    },
    methods: {
        async resetTask() {
            try {
                const response = await myApi.resetEventQueues([this.taskDetails.id]);
                this.fetchData();
            } catch (err) {
                console.error("Failed to reset event queues: ", err);
            }
        },
        async deleteTask() {
            try {
                const response = await myApi.deleteEventQueues([this.taskDetails.id]);
                this.fetchData();
            } catch (err) {
                console.error("Failed to delete event queues: ", err);
            }
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
    }
}
</script>

<style scoped>
.task-detail-content {
    display: flex;
    flex-direction: row;
    gap: 2rem;
}

.task-detail-column {
    display: flex;
    flex-direction: column;
}

.task-detail-row {
    margin-bottom: 0.75rem;
}

.task-detail-field {
    text-align: justify;
    line-height: 1.4;
    word-break: break-word;
    display: flex;
    flex-direction: row;
}

.task-detail-label {
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: auto !important;
}

.task-detail-field-name {
    font-weight: bold;
    width: 50%;
}

.task-detail-field-value {
    width: 50%;
}

/* Operations Column */
.operations {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Styling for placeholder operations section */
.operation-placeholder {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #f4f4f4;
    padding: 1rem;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 8px;
    height: 100%;
    width: fit-content;
    align-items: center;
    justify-items: center;
    justify-self: center;
}

.buttons {
    width: 50px;
    height: 50px;
    border: none;
    background-color: gray;
    color: white;
    border-radius: 5px;
}

:hover.buttons {
    background-color: rgb(145, 145, 145);
}

:active.buttons {
    background-color: rgb(108, 108, 108);
}
</style>
