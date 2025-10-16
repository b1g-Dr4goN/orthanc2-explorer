<template>
    <div>
        <div class="event-detail-container">
            <div class="event-detail-header"><strong>{{ $t('my_event_queue_tags.details') + " " +
                $t('my_event_queue_tags.event') + " #" + eventDetails[fieldMappings["id"]] }}</strong>
            </div>
            <div class="event-detail">
                <div class="event-detail-content">
                    <div class="event-detail-column">
                        <div class="event-detail-row" v-for="(field, i) in fields" :key="i">
                            <div class="event-detail-field">
                                <strong class="event-detail-title">
                                    {{ $t('my_event_queue_tags.' + field.fieldName) }}:&nbsp;
                                </strong>
                                <div class="event-detail-label" :title="eventDetails[fieldMappings[field.fieldName]]">
                                    {{ eventDetails[fieldMappings[field.fieldName]] }}
                                </div>
                                <div>
                                    <CopyToClipboardButton
                                        v-if="eventDetails[fieldMappings[field.fieldName]] && eventDetails[fieldMappings[field.fieldName]].toString().length > 0"
                                        :valueToCopy="eventDetails[fieldMappings[field.fieldName]]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="operations" style="width: 26%;">
                    <button :title="$t('my_event_queue_tags.reset')"
                        @click="handleResetEvent(`[${this.eventDetails.id}]`)"
                        class="btn btn-lg btn-secondary m-1 bi bi-arrow-repeat"></button>
                    <button :title="$t('my_event_queue_tags.update')"
                        @click="handleUpdateEvent(`[${this.eventDetails.id}]`)"
                        class="btn btn-lg btn-secondary m-1 bi bi-pencil"></button>
                    <button :title="$t('my_event_queue_tags.delete')"
                        @click="handleDeleteEvent(`[${this.eventDetails.id}]`)"
                        class="btn btn-lg btn-secondary m-1 bi bi-trash"></button>
                    <button class="dropdown btn btn-lg btn-secondary m-1 dropdown-toggle" type="button"
                        id="apiDropdownMenuId" data-bs-toggle="dropdown" aria-expanded="false">
                        <span data-bs-toggle="tooltip" title="API">
                            <i class="bi bi-code-slash"></i>
                        </span>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="apiDropdownMenuId">
                        <li>
                            <button class="dropdown-item" href="#" @click="copyIdToClipboard">{{ $t('copy_orthanc_id')
                            }}</button>
                        </li>
                        <li>
                            <TokenLinkButton :linkType="'dropdown-item'" :level="this.eventDetails.resource_type"
                                :linkUrl="getApiUrl('')" :resourcesOrthancId="[this.eventDetails.resource_id]"
                                :title="'/'" :tokenType="'download-instant-link'" :opensInNewTab="true">
                            </TokenLinkButton>
                        </li>
                        <li v-if="this.eventDetails.resource_type == 'instance'">
                            <TokenLinkButton :linkType="'dropdown-item'" :level="this.eventDetails.resource_type"
                                :linkUrl="getApiUrl('/tags?simplify')" :resourcesOrthancId="[this.eventDetails.resource_id]"
                                :title="'/tags?simplify'" :tokenType="'download-instant-link'" :opensInNewTab="true">
                            </TokenLinkButton>
                        </li>
                        <li>
                            <TokenLinkButton :linkType="'dropdown-item'" :level="this.eventDetails.resource_type"
                                :linkUrl="getApiUrl('/metadata?expand')" :resourcesOrthancId="[this.eventDetails.resource_id]"
                                :title="'/metadata?expand'" :tokenType="'download-instant-link'" :opensInNewTab="true">
                            </TokenLinkButton>
                        </li>
                        <li>
                            <TokenLinkButton :linkType="'dropdown-item'" :level="this.eventDetails.resource_type"
                                :linkUrl="getApiUrl('/statistics')" :resourcesOrthancId="[this.eventDetails.resource_id]"
                                :title="'/statistics'" :tokenType="'download-instant-link'" :opensInNewTab="true">
                            </TokenLinkButton>
                        </li>
                        <li>
                            <TokenLinkButton :linkType="'dropdown-item'" :level="this.eventDetails.resource_type"
                                :linkUrl="getApiUrl('/attachments?expand')" :resourcesOrthancId="[this.eventDetails.resource_id]"
                                :title="'/attachments?expand'" :tokenType="'download-instant-link'"
                                :opensInNewTab="true">
                            </TokenLinkButton>
                        </li>
                    </ul>
                </div>
            </div>

            <table class="event-jobs-table">
                <thead>
                    <tr class="event-jobs-table-headers">
                        <th v-for="field in jobFields" :key="field.fieldName" :style="{ width: field.width }">
                            {{ field.fieldName }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="event-jobs-table-body" v-for="job in jobs" :key="job.id">
                        <td v-for="field in jobFields" :key="field.name" :title="job[field.name]">
                            {{ job[field.name] }}
                            <CopyToClipboardButton v-if="job[field.name] && job[field.name].toString().length > 0"
                                :valueToCopy="job[field.name]" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import CopyToClipboardButton from '../CopyToClipboardButton.vue';
import TokenLinkButton from '../TokenLinkButton.vue';
import api from "../../orthancApi";
import clipboardHelpers from "../../helpers/clipboard-helpers";

export default {
    components: {
        CopyToClipboardButton,
        TokenLinkButton,
    },
    props: {
        eventDetails: {
            type: Object,
            required: true
        },
        handleDeleteEvent: {
            type: Function,
            required: true
        },
        handleResetEvent: {
            type: Function,
            required: true
        },
        handleUpdateEvent: {
            type: Function,
            required: true
        }
    },
    data() {
        return {
            fields: [
                { fieldName: "id", width: "5%", placeholder: "1234", isOrderable: true },
                { fieldName: "app_id", width: "5%", placeholder: "ABCD1234", isOrderable: false },
                { fieldName: "app_type", width: "5%", placeholder: "StoreServer", isOrderable: false },
                { fieldName: "creation_time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true },
                { fieldName: "last_updated_time", width: "7%", placeholder: "YYYYDDMMTHHMMSS", isOrderable: true },
                { fieldName: "iuid", width: "13%", placeholder: "1.23.456", isOrderable: false },
                { fieldName: "resource_id", width: "13%", placeholder: "abcd-1234", isOrderable: false },
                { fieldName: "resource_type", width: "5%", placeholder: "Study", isOrderable: false },
                { fieldName: "delay_sec", width: "4%", placeholder: "1234", isOrderable: true },
                { fieldName: "retry", width: "3%", placeholder: "1234", isOrderable: true },
                { fieldName: "failed_reason", width: "11%", placeholder: "ABCD1234", isOrderable: false },
            ],
            fieldMappings: {
                "app_id": "app_id",
                "app_type": "app_type",
                "creation_time": "creationTime",
                "delay_sec": "delaySec",
                "failed_reason": "failedReason",
                "id": "id",
                "iuid": "iuid",
                "last_updated_time": "lastUpdatedTime",
                "resource_id": "resourceId",
                "resource_type": "resourceType",
                "retry": "retry",
            },
            jobFields: [
                { "fieldName": "Job ID", "name": "id" },
                { "fieldName": "Creation Time", "name": "creationTime" },
                { "fieldName": "Last Updated Time", "name": "lastUpdatedTime" },
            ],
            jobs: this.eventDetails.jobs ?? [],
        };
    },
    methods: {
        copyIdToClipboard() {
            clipboardHelpers.copyToClipboard(this.eventDetails.resource_id);
        },
        getApiUrl(subRoute) {
            return api.getApiUrl(this.eventDetails.resource_type, this.eventDetails.resource_id, subRoute);
        },
    }
}
</script>

<style scoped>
.event-detail {
    padding: 0 28px;
    font-size: 14px;
    display: flex;
    flex-direction: col;
    gap: 10px;
}

.event-detail-content {
    display: flex;
    flex-direction: row;
    width: 100%;
    gap: 10px;
}

.event-detail-column {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 10px;
}

.event-detail-row {
    margin-top: auto;
    margin-bottom: auto;
}

.event-detail-field {
    text-align: justify;
    line-height: 1.4;
    word-break: break-word;
    padding: 2px 12px;
    display: flex;
    flex-direction: row;
}

.event-detail-title {
    margin-top: auto;
    margin-bottom: auto;
}

.event-detail-label {
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: auto !important;
    margin-top: auto;
    margin-bottom: auto;
}

.event-jobs-table {
    background-color: white;
    width: 88%;
    font-size: 14px;
    margin: 6px auto 16px auto;
}

.event-jobs-table-headers {
    background-color: #cccccc;
}

.event-jobs-table-body {
    border-top: 1px solid rgb(108, 108, 108);
}

.event-jobs-table-body td {
    overflow-x: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:hover.event-jobs-table-body {
    background-color: var(--study-selected-color);
}

.operations {
    height: fit-content;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

:hover.buttons {
    background-color: rgb(145, 145, 145);
}

:active.buttons {
    background-color: rgb(108, 108, 108);
}
</style>
