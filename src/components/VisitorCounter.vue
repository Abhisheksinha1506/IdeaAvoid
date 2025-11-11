<template>
  <div class="visitor-counter">
    <span class="counter-label">Visitors:</span>
    <span class="counter-number">{{ formattedCount }}</span>
  </div>
</template>

<script>
import { visitorsAPI } from '../data/apiClient'

export default {
  name: 'VisitorCounter',
  data() {
    return {
      visitorCount: 0,
      loading: true
    }
  },
  computed: {
    formattedCount() {
      if (this.loading) return '...'
      return this.visitorCount.toLocaleString()
    }
  },
  mounted() {
    this.incrementVisitor()
  },
  methods: {
    async incrementVisitor() {
      try {
        // First, get current count
        const countResponse = await visitorsAPI.getCount()
        this.visitorCount = countResponse.totalVisitors || 0
        this.loading = false
        
        // Then increment (fire and forget - don't wait for response)
        visitorsAPI.increment().catch(err => {
          console.warn('Failed to increment visitor count:', err)
        })
      } catch (error) {
        console.error('Error fetching visitor count:', error)
        this.loading = false
        // Fallback: show cached count if available
        const cached = localStorage.getItem('visitorCount')
        if (cached) {
          this.visitorCount = parseInt(cached, 10)
        }
      }
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

