<template>
    <div class="modal-overlay" id="confirmModal">
        <div class="modal-box">
            <h2 class="modal-title">Confirmation</h2>
            <p>Are you sure you want to {{ action }} these <strong>{{ this.events.length }}</strong> events?</p>
            <p><i>{{ events }}</i></p>
            <div class="modal-actions">
                <button @click="confirmAction()">{{ confirmText }}</button>
                <button @click="closeModal()">{{ cancelText }}</button>
            </div>
        </div>
    </div>
</template>

<script>
import myApi from './myApi';

export default {
    name: 'MyConfirmModal',
    props: {
        events: {
            type: Array,
            required: true
        },
        action: {
            type: String,
            required: true
        },
        confirmText: {
            type: String,
            default: 'Confirm'
        },
        cancelText: {
            type: String,
            default: 'Cancel'
        },
        closeModal: {
            type: Function,
            required: true
        },
        fetchData: {
            type: Function,
            required: true
        },
        deselectAll: {
            type: Function,
            required: true
        },
        notify: {
            type: Function,
            required: true
        }
    },
    mounted() {
        window.addEventListener('keydown', this.handleKeyDown);
    },
    beforeUnmount() {
        window.removeEventListener('keydown', this.handleKeyDown);
    },
    methods: {
        confirmAction() {
            if (this.action === 'delete') {
                this.deleteSelectedEvents();
            } else if (this.action === 'reset') {
                this.resetSelectedEvents();
            }
            this.closeModal();
        },
        async deleteSelectedEvents() {
            // Handle deletion logic
            try {
                const response = await myApi.deleteEventQueues(this.events);
                this.notify({
                    message: `Successfully deleted ${this.events.length} event(s).`,
                    type: 'success'
                });
                this.deselectAll();
                this.fetchData();
            } catch (err) {
                console.error("Failed to delete event queues: ", err);
                this.notify({
                    message: `Failed to delete events: ${err.message}`,
                    type: 'error'
                });
            }
        },
        async resetSelectedEvents() {
            // Handle reset logic
            try {
                const response = await myApi.resetEventQueues(this.events);
                this.notify({
                    message: `Successfully reset ${this.events.length} events.`,
                    type: 'success'
                });
                this.deselectAll();
                this.fetchData();
            } catch (err) {
                console.error("Failed to reset event queues: ", err);
                this.notify({
                    message: `Failed to reset events: ${err.message}`,
                    type: 'error'
                });
            }
        },
        handleKeyDown(e) {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            if (e.key === 'Enter') {
                setTimeout(() => this.confirmAction(), 0);
            }   
        },
    },
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-box {
    background-color: white;
    padding: 20px 24px;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 666px;
    max-width: 90%;
    text-align: center;
}

.modal-box h2 {
    margin-top: 0;
}

.modal-title {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 10px;
}

.modal-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 20px;
}

.modal-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.modal-actions button:last-child {
    background-color: #e0e0e0;
}

.modal-actions button:last-child:hover {
    background-color: #cfcfcf;
}

.modal-actions button:last-child:active {
    background-color: #b9b8b8;
}

.modal-actions button:first-child {
    background-color: #007bff;
    color: white;
}

.modal-actions button:first-child:hover {
    background-color: #0070e7;
    color: white;
}

.modal-actions button:first-child:active {
    background-color: #0165cf;
    color: white;
}
</style>