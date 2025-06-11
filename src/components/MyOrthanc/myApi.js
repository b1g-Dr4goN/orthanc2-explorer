import { myOrthancApi } from "./myConfigurations";
import axios from 'axios';

const username = 'orthanc';
const password = 'orthanc';
const auth = 'Basic ' + btoa(username + ':' + password);
const headers = {
    'Authorization': auth,
    'Content-Type': 'application/json',
};

export default {
    async getEventQueues() {
        return ((await axios.get(myOrthancApi + "/event-queues", headers)).data);
    },
    async resetEventQueues(events) {
        return (await axios.post(myOrthancApi + "/reset-event-queues", events, headers));
    },
    async deleteEventQueues(events) {
        const body = JSON.stringify(events);
        return (await axios.delete(myOrthancApi + "/delete-event-queues", { ...headers, data: events}));
    }
}