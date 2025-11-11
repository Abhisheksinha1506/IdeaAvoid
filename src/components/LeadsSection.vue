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
                <th class="col-saturation">
                  <div class="th-with-info">
                    <span>Saturation</span>
                    <button 
                      class="info-icon-btn" 
                      @click="showSaturationInfo = true"
                      title="Learn how saturation is calculated"
                      aria-label="Show saturation calculation info"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="info-icon-svg">
                        <path d="M272 112C272 85.5 293.5 64 320 64C346.5 64 368 85.5 368 112C368 138.5 346.5 160 320 160C293.5 160 272 138.5 272 112zM224 256C224 238.3 238.3 224 256 224L320 224C337.7 224 352 238.3 352 256L352 512L384 512C401.7 512 416 526.3 416 544C416 561.7 401.7 576 384 576L256 576C238.3 576 224 561.7 224 544C224 526.3 238.3 512 256 512L288 512L288 288L256 288C238.3 288 224 273.7 224 256z"/>
                      </svg>
                    </button>
                  </div>
                </th>
                <th class="col-validation">
                  <div class="th-with-info">
                    <span>Validation</span>
                    <button 
                      class="info-icon-btn" 
                      @click="showValidationInfo = true"
                      title="Learn how validation works"
                      aria-label="Show validation info"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" class="info-icon-svg">
                        <path d="M272 112C272 85.5 293.5 64 320 64C346.5 64 368 85.5 368 112C368 138.5 346.5 160 320 160C293.5 160 272 138.5 272 112zM224 256C224 238.3 238.3 224 256 224L320 224C337.7 224 352 238.3 352 256L352 512L384 512C401.7 512 416 526.3 416 544C416 561.7 401.7 576 384 576L256 576C238.3 576 224 561.7 224 544C224 526.3 238.3 512 256 512L288 512L288 288L256 288C238.3 288 224 273.7 224 256z"/>
                      </svg>
                    </button>
                  </div>
                </th>
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
                <td class="col-saturation">
                  <div class="cell-content">
                    <SaturationIndicator 
                      v-if="hasSaturationData(lead.saturation)" 
                      :saturation="lead.saturation" 
                    />
                    <span v-else class="no-data">—</span>
                  </div>
                </td>
                <td class="col-validation">
                  <div class="cell-content">
                    <ValidationStatus 
                      v-if="hasValidationData(lead.validation)" 
                      :validation="lead.validation"
                      :saturation="lead.saturation"
                      :idea-id="lead.id"
                      @verify="handleVerify"
                    />
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
        <!-- Header Info Modals -->
        <InfoModal 
          :show="showSaturationInfo" 
          title="How Saturation is Calculated"
          @close="showSaturationInfo = false"
        >
          <SaturationInfo />
        </InfoModal>
        <InfoModal 
          :show="showValidationInfo" 
          title="How Validation Works"
          @close="showValidationInfo = false"
        >
          <ValidationInfo />
        </InfoModal>
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
import SaturationIndicator from './SaturationIndicator.vue'
import ValidationStatus from './ValidationStatus.vue'
import InfoModal from './InfoModal.vue'
import SaturationInfo from './SaturationInfo.vue'
import ValidationInfo from './ValidationInfo.vue'
import { validationAPI } from '../data/apiClient'

export default {
  name: 'LeadsSection',
  components: {
    Pagination,
    SaturationIndicator,
    ValidationStatus,
    InfoModal,
    SaturationInfo,
    ValidationInfo
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
  mounted() {
    // Debug: Check if data is being passed correctly
    if (this.leads && this.leads.length > 0) {
      const firstLead = this.leads[0]
      console.log('🔍 LeadsSection - First lead data:', {
        name: firstLead.name,
        hasSaturation: !!firstLead.saturation,
        hasValidation: !!firstLead.validation,
        saturation: firstLead.saturation,
        validation: firstLead.validation,
        saturationType: typeof firstLead.saturation,
        validationType: typeof firstLead.validation
      })
      
      // Check all leads for saturation/validation
      const withSaturation = this.leads.filter(l => this.hasSaturationData(l.saturation)).length
      const withValidation = this.leads.filter(l => this.hasValidationData(l.validation)).length
      console.log(`📊 Leads with saturation: ${withSaturation}/${this.leads.length}`)
      console.log(`📊 Leads with validation: ${withValidation}/${this.leads.length}`)
    }
  },
  data() {
    return {
      showSaturationInfo: false,
      showValidationInfo: false
    }
  },
  methods: {
    hasSaturationData(saturation) {
      // Check if saturation exists, is an object, and has at least one property
      return saturation && 
             typeof saturation === 'object' && 
             saturation !== null &&
             Object.keys(saturation).length > 0
    },
    hasValidationData(validation) {
      // Check if validation exists, is an object, and has at least one property
      return validation && 
             typeof validation === 'object' && 
             validation !== null &&
             Object.keys(validation).length > 0
    },
    handlePageChange(page) {
      this.$emit('page-change', page)
    },
    handleDownload() {
      this.$emit('download-csv')
    },
    async handleVerify(ideaId) {
      try {
        // Find the idea in the current leads to get name/description
        const idea = this.leads.find(lead => lead.id === ideaId)
        if (!idea) {
          console.error(`❌ Idea ${ideaId} not found in leads`)
          return
        }
        
        console.log(`🔍 Validating idea ${ideaId}: "${idea.name || idea.title}"...`)
        
        // Try validation by ID first
        let validation
        try {
          validation = await validationAPI.validateIdea(ideaId)
        } catch (idError) {
          // If ID validation fails (e.g., ideasService not available), try by name/description
          console.warn(`⚠️ Validation by ID failed, trying by name/description:`, idError.response?.data || idError.message)
          try {
            validation = await validationAPI.validate({
              name: idea.name || idea.title,
              description: idea.description,
              tags: idea.tags || []
            })
          } catch (nameError) {
            console.error('❌ Validation by name also failed:', nameError.response?.data || nameError.message)
            throw nameError
          }
        }
        
        console.log(`✅ Validation response:`, validation)
        console.log(`📊 Validation data:`, {
          hasValidation: !!validation.validation,
          hasSaturation: !!validation.saturation,
          totalCompetitors: validation.validation?.aggregatedScore?.totalCompetitors || 0,
          status: validation.validation?.status,
          sources: validation.validation?.sources?.length || 0,
          sourcesDetails: validation.validation?.sources?.map(s => ({
            source: s.source,
            competitors: s.competitorCount || s.similarIdeas || 0
          }))
        })
        
        // Emit event to update the idea with validation data
        this.$emit('idea-validated', { ideaId, validation })
      } catch (error) {
        console.error('❌ Failed to validate idea:', error)
        console.error('Error details:', error.response?.data || error.message)
        // Show user-friendly error (you might want to add a toast/notification here)
        alert(`Failed to validate idea: ${error.response?.data?.message || error.message || 'Unknown error'}`)
      }
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

<style scoped>
.th-with-info {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  line-height: 1;
}

.th-with-info .info-icon-btn {
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280; /* gray-500 */
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.th-with-info .info-icon-btn:hover {
  color: #374151; /* gray-700 */
  background: #f3f4f6; /* gray-100 */
}

.th-with-info .info-icon-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35); /* focus ring */
}

.th-with-info .info-icon-btn svg.info-icon-svg {
  width: 16px;
  height: 16px;
  display: block;
  fill: currentColor;
}

/* Table header typography harmonize */
th.col-saturation,
th.col-validation {
  white-space: nowrap;
}
</style>

