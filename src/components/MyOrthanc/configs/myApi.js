import { myOrthancApi } from "./myConfigurations";
import axios from 'axios';

export default {
    async getEventQueues(params = {}) {
        return (await axios.get(myOrthancApi + "/event-queues", { params })).data;
    },
    async getEventQueue(id) {
        return (await axios.get(myOrthancApi + `/event-queues/${id}`)).data;
    },
    async updateEventQueue(id, event) {
        return (await axios.post(myOrthancApi + `/update-event-queue/${id}`, event));
    },
    async resetEventQueues(events) {
        return (await axios.post(myOrthancApi + "/reset-event-queues", events));
    },
    async deleteEventQueues(events) {
        return (await axios.post(myOrthancApi + "/delete-event-queues", events));
    }
}