<template>
  <div class="lead-card">
    <div class="lead-header">
      <div class="lead-meta">
        <div class="lead-tags" v-if="lead.tags && lead.tags.length > 0">
          <span 
            v-for="(tag, index) in lead.tags.slice(0, 5)" 
            :key="index" 
            class="lead-tag"
          >
            {{ tag }}
          </span>
          <span v-if="lead.tags.length > 5" class="lead-tag-more">
            +{{ lead.tags.length - 5 }} more
          </span>
        </div>
      </div>
    </div>
    <h3 class="lead-title">{{ lead.name || lead.title }}</h3>
    <p class="lead-description">{{ lead.description }}</p>
    <div v-if="lead.painPoints && lead.painPoints.length > 0" class="pain-points-section">
      <div class="pain-points-header">
        <span class="pain-points-title">{{ lead.painPoints.length }} Pain Point{{ lead.painPoints.length > 1 ? 's' : '' }}</span>
        <span v-if="lead.painPoints.length > 5" class="pain-points-more">(showing 5 of {{ lead.painPoints.length }})</span>
      </div>
      <ul class="pain-points-list">
        <li 
          v-for="(painPoint, index) in lead.painPoints.slice(0, 5)" 
          :key="index" 
          class="pain-point-item"
        >
          <span class="pain-point-bullet"></span>
          <span class="pain-point-text">{{ formatPainPoint(painPoint) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeadCard',
  props: {
    lead: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatPainPoint(painPoint) {
      // Remove leading bullet points or special characters
      let formatted = painPoint.trim()
      
      // Remove common prefixes
      formatted = formatted.replace(/^[•\-\*\u2022]\s*/, '')
      formatted = formatted.replace(/^[•\-\*\u2022]\s*/, '') // Remove double bullets
      
      // Capitalize first letter
      if (formatted.length > 0) {
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)
      }
      
      return formatted
    }
  }
}
</script>

