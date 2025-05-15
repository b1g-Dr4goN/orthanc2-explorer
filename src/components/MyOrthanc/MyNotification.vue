<template>
  <div v-if="visible" :class="['notification', notification.message.type]" class="notification">
    <i v-if="notification.message.type === 'success'" class="bi bi-check-circle"></i> 
    <i v-if="notification.message.type === 'warning'" class="bi bi-exclamation-circle"></i>
    <i v-if="notification.message.type === 'error'" class="bi bi-x-circle"></i>
    &nbsp;{{ notification.message.message }}
  </div>
</template>

<script>
export default {
  name: 'MyNotification',
  props: {
    notification: {
      type: Object,
      required: true,
    },
    duration: {
      type: Number,
      default: 3000, // auto-dismiss after 3 seconds
    }
  },
  data() {
    return {
      visible: false,
    };
  },
  watch: {
    notification(newVal) {
      if (newVal) {
        this.visible = true;
        setTimeout(() => {
          this.visible = false;
        }, this.duration);
      }
    }
  }
};
</script>

<style scoped>
.notification {
  float: right;
  padding: 12px 20px;
  margin: 0;
  border-radius: 6px;
  font-size: 16px;
  color: #fff;
  animation: fadeIn 0.3s ease-in-out;
}

/* Types */
.success {
  background-color: #00a226;
}

.warning {
  background-color: #ffc107;
  color: #333;
}

.error {
  background-color: #dc3545;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
