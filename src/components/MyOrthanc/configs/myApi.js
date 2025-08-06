import { myOrthancApi } from "./myConfigurations";
import axios from 'axios';

export default {
    async getEventQueues() {
        return ((await axios.get(myOrthancApi + "/event-queues")).data);
    },
    async resetEventQueues(events) {
        return (await axios.post(myOrthancApi + "/reset-event-queues", events));
    },
    async deleteEventQueues(events) {
        return (await axios.post(myOrthancApi + "/delete-event-queues", events));
    }
}