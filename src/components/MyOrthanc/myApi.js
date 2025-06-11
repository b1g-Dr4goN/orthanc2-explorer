import { myOrthancApi } from "./myConfigurations";
import axios from 'axios';

// const username = 'orthanc';
// const password = 'orthanc';
// const auth = 'Basic ' + btoa(username + ':' + password);
// const headers = {
//     'Authorization': auth,
//     'Content-Type': 'application/json',
// };

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