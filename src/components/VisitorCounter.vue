<template>
  <div class="visitor-counter">
    <span class="counter-label">Visitors:</span>
    <span class="counter-number">{{ formattedCount }}</span>
  </div>
</template>

<script>
export default {
  name: 'VisitorCounter',
  data() {
    return {
      visitorCount: 0
    }
  },
  computed: {
    formattedCount() {
      return this.visitorCount.toLocaleString()
    }
  },
  mounted() {
    this.incrementVisitor()
  },
  methods: {
    incrementVisitor() {
      // Get current count from localStorage
      let count = parseInt(localStorage.getItem('visitorCount') || '0', 10)
      
      // Increment on every page load
      count++
      localStorage.setItem('visitorCount', count.toString())
      
      this.visitorCount = count
    }
  }
}
</script>

<style scoped>
.visitor-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  font-family: 'Inter', sans-serif;
  padding: 0.5rem 0;
}

.counter-label {
  font-weight: 500;
}

.counter-number {
  font-weight: 600;
  color: var(--primary-color, #2563eb);
}

@media (max-width: 640px) {
  .visitor-counter {
    font-size: 12px;
    gap: 0.25rem;
  }
}
</style>

