<template>
  <section class="leads-section">
    <div class="container">
      <div class="section-header">
        <div class="section-header-left">
          <h2 class="section-title">Over-Saturated Ideas to Avoid</h2>
          <span class="leads-count" v-if="!loading">
            Showing {{ leads.length }} of {{ totalCount.toLocaleString() }} ideas (already implemented many times)
          </span>
          <span class="leads-count" v-else>Loading...</span>
        </div>
        <div class="section-header-right">
          <button 
            v-if="!loading && totalCount > 0" 
            @click="handleDownload" 
            class="download-btn"
            title="Download all ideas as Excel file"
          >
            Download Excel
          </button>
        </div>
      </div>
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading ideas from JSON file...</p>
      </div>
      <div v-else-if="totalCount === 0" class="empty-state">
        <p>No ideas found. Try adjusting your filters.</p>
        <p class="empty-state-hint">These are ideas that have been implemented many times and should be avoided</p>
      </div>
      <div v-else>
        <div class="table-container">
          <table class="leads-table">
            <thead>
              <tr>
                <th class="col-name">Name</th>
                <th class="col-description">Description</th>
                <th class="col-tags">Tags</th>
                <th class="col-pain-points">Pain Points</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lead in leads" :key="lead.id" class="table-row">
                <td class="col-name">
                  <div class="cell-content">
                    <strong class="lead-name">{{ lead.name || lead.title }}</strong>
                  </div>
                </td>
                <td class="col-description">
                  <div class="cell-content">
                    <p class="lead-description">{{ lead.description }}</p>
                  </div>
                </td>
                <td class="col-tags">
                  <div class="cell-content">
                    <div class="lead-tags" v-if="lead.tags && lead.tags.length > 0">
                      <span 
                        v-for="(tag, index) in lead.tags" 
                        :key="index" 
                        class="lead-tag"
                      >
                        {{ tag }}
                      </span>
                    </div>
                    <span v-else class="no-data">—</span>
                  </div>
                </td>
                <td class="col-pain-points">
                  <div class="cell-content">
                    <ul v-if="lead.painPoints && lead.painPoints.length > 0" class="pain-points-list">
                      <li 
                        v-for="(painPoint, index) in lead.painPoints" 
                        :key="index" 
                        class="pain-point-item"
                      >
                        {{ formatPainPoint(painPoint) }}
                      </li>
                    </ul>
                    <span v-else class="no-data">—</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalCount"
          :items-per-page="itemsPerPage"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </section>
</template>

<script>
import Pagination from './Pagination.vue'

export default {
  name: 'LeadsSection',
  components: {
    Pagination
  },
  props: {
    leads: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    totalCount: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      required: true
    },
    allLeads: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handlePageChange(page) {
      this.$emit('page-change', page)
    },
    handleDownload() {
      this.$emit('download-csv')
    },
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

