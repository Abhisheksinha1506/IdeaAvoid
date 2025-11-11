<template>
  <div id="app">
    <Header />
    <main>
      <HeroSection 
        :total-ideas="stats ? stats.totalIdeas : (metadata ? metadata.uniqueIdeas : 0)"
        :unique-tags="stats ? stats.uniqueTags : 0"
        :ideas-with-tags="stats ? stats.ideasWithTags : 0"
        :loading="loading"
      />
      <FiltersSection 
        :filters="filters"
        :available-tags="filteredTags"
        @update-filters="handleFilterUpdate"
        @refresh-data="loadData"
      />
      <LeadsSection 
        :leads="paginatedLeads"
        :loading="loading"
        :total-count="filteredLeads.length"
        :current-page="currentPage"
        :total-pages="totalPages"
        :items-per-page="filters.itemsPerPage"
        @page-change="handlePageChange"
        @download-csv="handleDownloadClick"
        @idea-validated="handleIdeaValidated"
      />
    </main>
    <Footer @show-privacy="showPrivacyModal = true" />
    <InfoModal 
      :show="showPrivacyModal" 
      title="Privacy Policy"
      @close="showPrivacyModal = false"
    >
      <PrivacyPolicy />
    </InfoModal>
  </div>
</template>

<script>
import Header from './components/Header.vue'
import HeroSection from './components/HeroSection.vue'
import FiltersSection from './components/FiltersSection.vue'
import LeadsSection from './components/LeadsSection.vue'
import Footer from './components/Footer.vue'
import InfoModal from './components/InfoModal.vue'
import PrivacyPolicy from './components/PrivacyPolicy.vue'
import { loadIdeas, extractUniqueTags } from './data/loadIdeas'
import { validationAPI } from './data/apiClient'
import * as XLSX from 'xlsx'

export default {
  name: 'App',
  components: {
    Header,
    HeroSection,
    FiltersSection,
    LeadsSection,
    Footer,
    InfoModal,
    PrivacyPolicy
  },
  data() {
    return {
      leads: [],
      loading: true,
      metadata: null,
      stats: null,
      availableTags: [],
      filters: {
        search: '',
        tag: '',
        category: '',
        itemsPerPage: 25
      },
      currentPage: 1,
      totalCount: 0,
      showPrivacyModal: false
    }
  },
  mounted() {
    this.loadData()
  },
  computed: {
    filteredLeads() {
      let filtered = [...this.leads]

      // Search filter
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase()
        filtered = filtered.filter(lead => 
          (lead.name && lead.name.toLowerCase().includes(searchLower)) ||
          (lead.title && lead.title.toLowerCase().includes(searchLower)) ||
          (lead.description && lead.description.toLowerCase().includes(searchLower)) ||
          (lead.tags && lead.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        )
      }

      // Tag filter
      if (this.filters.tag) {
        filtered = filtered.filter(lead => 
          lead.tags && lead.tags.includes(this.filters.tag)
        )
      }

      // Category filter
      if (this.filters.category) {
        filtered = filtered.filter(lead => 
          lead.category === this.filters.category
        )
      }

      return filtered
    },
    paginatedLeads() {
      const start = (this.currentPage - 1) * this.filters.itemsPerPage
      const end = start + this.filters.itemsPerPage
      return this.filteredLeads.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredLeads.length / this.filters.itemsPerPage)
    },
    filteredTags() {
      // Get tags from leads that match the current search (if any)
      let leadsToCheck = this.leads
      
      // If there's a search query, filter leads first to get relevant tags
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase()
        leadsToCheck = this.leads.filter(lead => 
          (lead.name && lead.name.toLowerCase().includes(searchLower)) ||
          (lead.title && lead.title.toLowerCase().includes(searchLower)) ||
          (lead.description && lead.description.toLowerCase().includes(searchLower)) ||
          (lead.tags && lead.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        )
      }
      
      // Extract unique tags from filtered leads
      const tagSet = new Set()
      leadsToCheck.forEach(lead => {
        if (lead.tags && Array.isArray(lead.tags)) {
          lead.tags.forEach(tag => {
            if (tag && typeof tag === 'string' && tag.trim() !== '') {
              tagSet.add(tag)
            }
          })
        }
      })
      
      return Array.from(tagSet).sort()
    }
  },
  watch: {
    filters: {
      handler() {
        // Reset to page 1 when filters change
        this.currentPage = 1
      },
      deep: true
    },
    totalPages(newTotalPages) {
      // If current page exceeds total pages, go to last page
      if (this.currentPage > newTotalPages && newTotalPages > 0) {
        this.currentPage = newTotalPages
      }
    }
  },
  methods: {
    async loadData() {
      console.log('🔄 Loading data from combined_ideas.json...')
      this.loading = true
      try {
        const data = await loadIdeas()
        this.leads = data.ideas
        this.metadata = data.metadata
        this.stats = data.stats || null
        this.availableTags = extractUniqueTags(data.ideas)
        console.log(`✅ Loaded ${data.ideas.length} ideas with ${this.availableTags.length} unique tags`)
        if (this.stats) {
          console.log(`📊 Stats: ${this.stats.totalIdeas} ideas, ${this.stats.uniqueTags} unique tags, ${this.stats.ideasWithTags} ideas with tags`)
        }
        this.loading = false
      } catch (error) {
        console.error('❌ Failed to load ideas:', error)
        this.loading = false
      }
    },
    handleFilterUpdate(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },
    handlePageChange(page) {
      this.currentPage = page
      // Scroll to top of leads section
      this.$nextTick(() => {
        const leadsSection = document.querySelector('.leads-section')
        if (leadsSection) {
          leadsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    handleDownloadClick() {
      this.downloadCSV()
    },
    downloadCSV() {
      // Convert all ideas to Excel format with worksheet name "Avoid Data"
      const ideas = this.leads
      
      if (ideas.length === 0) {
        console.warn('No ideas to download')
        return
      }
      
      // Create workbook
      const workbook = XLSX.utils.book_new()
      
      // Prepare data for Excel - using same logic as UI to ensure updated values
      const excelData = ideas.map(idea => {
        // Get competitor count - use saturation first, fallback to validation aggregatedScore
        // This ensures we get the most updated value (same as UI logic)
        const competitorCount = idea.saturation?.competitorCount !== undefined && idea.saturation?.competitorCount !== null
          ? idea.saturation.competitorCount
          : (idea.validation?.aggregatedScore?.totalCompetitors !== undefined 
              ? idea.validation.aggregatedScore.totalCompetitors 
              : '');
        
        // Format competitor count as number (same as UI)
        const formattedCompetitorCount = competitorCount !== '' 
          ? (typeof competitorCount === 'number' ? competitorCount : Number(competitorCount) || '')
          : '';
        
        // Get saturation level - validate same as UI
        const saturationLevel = idea.saturation?.level;
        const validLevels = ['low', 'medium', 'high', 'unknown'];
        const formattedSaturationLevel = validLevels.includes(saturationLevel) 
          ? saturationLevel.charAt(0).toUpperCase() + saturationLevel.slice(1) 
          : '';
        
        // Get market type - validate same as UI
        const marketType = idea.saturation?.marketType;
        const validMarketTypes = ['blue ocean', 'red ocean'];
        const formattedMarketType = validMarketTypes.includes(marketType) ? marketType : '';
        
        // Get TAM - validate same as UI
        const tam = idea.saturation?.tam;
        const formattedTAM = tam && typeof tam === 'string' ? tam.trim() : '';
        
        // Get validation status - use same logic as ValidationStatus component
        const validationStatus = this.getValidationStatus(idea);
        
        // Get last verified - check multiple sources like UI
        const lastVerified = idea.saturation?.lastVerified 
          || idea.validation?.lastChecked 
          || idea.validation?.sources?.[0]?.lastChecked 
          || '';
        
        return {
          'Name': idea.name || idea.title || '',
          'Description': idea.description || '',
          'Tags': Array.isArray(idea.tags) ? idea.tags.join('; ') : '',
          'Pain Points': Array.isArray(idea.painPoints) 
            ? idea.painPoints.map(pp => this.formatPainPoint(pp)).join('; ') 
            : '',
          'Category': idea.category || '',
          'Saturation Level': formattedSaturationLevel,
          'Competitor Count': formattedCompetitorCount,
          'Market Type': formattedMarketType,
          'TAM': formattedTAM,
          'Validation Status': validationStatus,
          'Last Verified': lastVerified ? new Date(lastVerified).toLocaleString() : ''
        }
      })
      
      // Create data worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 30 }, // Name
        { wch: 60 }, // Description
        { wch: 40 }, // Tags
        { wch: 60 }, // Pain Points
        { wch: 15 }, // Category
        { wch: 15 }, // Saturation Level
        { wch: 15 }, // Competitor Count
        { wch: 15 }, // Market Type
        { wch: 15 }, // TAM
        { wch: 15 }, // Validation Status
        { wch: 20 }  // Last Verified
      ]
      worksheet['!cols'] = columnWidths
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Avoid Data')
      
      // Generate Excel file and download
      const fileName = `avoid_data_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)
      
      console.log(`✅ Downloaded ${ideas.length} ideas as Excel file`)
    },
    formatPainPoint(painPoint) {
      if (!painPoint || typeof painPoint !== 'string') return ''
      
      let formatted = painPoint.trim()
      
      // Remove leading bullet points or special characters
      formatted = formatted.replace(/^[•\-\*\u2022]\s*/, '')
      formatted = formatted.replace(/^[•\-\*\u2022]\s*/, '') // Remove double bullets
      
      // Capitalize first letter
      if (formatted.length > 0) {
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)
      }
      
      return formatted
    },
    getValidationStatus(idea) {
      // Use same logic as ValidationStatus component to ensure consistency
      const validation = idea.validation || {}
      const totalCompetitors = validation.aggregatedScore?.totalCompetitors || 0
      const hasSources = validation.sources && validation.sources.length > 0
      
      // If no competitors found, show unverified
      if (totalCompetitors === 0) {
        if (hasSources) {
          return 'Unverified' // Validation ran but found 0 competitors
        }
        return 'Unverified' // No validation yet
      }
      
      // If competitors are found and we have validation sources, show as verified
      if (totalCompetitors > 0 && hasSources) {
        return 'Verified'
      }
      
      // Fallback to backend status if available
      const backendStatus = validation.status
      if (backendStatus && ['verified', 'pending', 'unverified'].includes(backendStatus)) {
        if (backendStatus === 'verified' || backendStatus === 'unverified') {
          return backendStatus.charAt(0).toUpperCase() + backendStatus.slice(1)
        }
        if (backendStatus === 'pending') {
          return 'Pending'
        }
      }
      
      return 'Unverified'
    },
    handleIdeaValidated({ ideaId, validation }) {
      console.log(`🔄 Handling validation update for idea ${ideaId}`, validation)
      // Update the idea in the leads array with new validation data
      const ideaIndex = this.leads.findIndex(lead => lead.id === ideaId)
      if (ideaIndex === -1) {
        console.warn(`⚠️ Idea with ID ${ideaId} not found for validation update`)
        console.warn(`Available IDs:`, this.leads.slice(0, 5).map(l => l.id))
        return
      }

      const currentIdea = this.leads[ideaIndex]
      const newValidation = validation.validation
      const newSaturation = validation.saturation

      // Helper to check if validation data is valid and meaningful
      const isValidValidation = (val) => {
        if (!val || typeof val !== 'object') return false
        // Must have either sources or aggregatedScore with competitors
        const hasSources = val.sources && Array.isArray(val.sources) && val.sources.length > 0
        const hasCompetitors = val.aggregatedScore?.totalCompetitors !== undefined && val.aggregatedScore.totalCompetitors > 0
        return hasSources || hasCompetitors || val.status === 'verified'
      }

      // Helper to check if saturation data is valid
      const isValidSaturation = (sat) => {
        if (!sat || typeof sat !== 'object') return false
        // Must have at least level or competitorCount
        return sat.level !== undefined || sat.competitorCount !== undefined
      }

      // Only update if new data is valid and better than existing
      let updatedValidation = currentIdea.validation
      let updatedSaturation = currentIdea.saturation

      // Update validation only if new one is valid
      if (isValidValidation(newValidation)) {
        const currentCompetitors = currentIdea.validation?.aggregatedScore?.totalCompetitors || 0
        const newCompetitors = newValidation.aggregatedScore?.totalCompetitors || 0
        
        // Only update if new validation has more competitors or is verified
        if (newCompetitors > currentCompetitors || 
            (newValidation.status === 'verified' && currentIdea.validation?.status !== 'verified') ||
            !currentIdea.validation) {
          updatedValidation = newValidation
          console.log(`✅ Updating validation: ${currentCompetitors} → ${newCompetitors} competitors`)
        } else {
          console.log(`⚠️ Keeping existing validation (${currentCompetitors} competitors) - new has ${newCompetitors}`)
        }
      } else if (newValidation) {
        console.warn(`⚠️ New validation data is invalid, keeping existing`)
      }

      // Update saturation only if new one is valid
      if (isValidSaturation(newSaturation)) {
        const currentCompetitors = currentIdea.saturation?.competitorCount || 0
        const newCompetitors = newSaturation.competitorCount || 0
        
        // Only update if new saturation has more competitors or better data
        if (newCompetitors > currentCompetitors || 
            (newSaturation.level && !currentIdea.saturation?.level) ||
            !currentIdea.saturation) {
          updatedSaturation = newSaturation
          console.log(`✅ Updating saturation: ${currentCompetitors} → ${newCompetitors} competitors, ${currentIdea.saturation?.level || 'none'} → ${newSaturation.level}`)
        } else {
          console.log(`⚠️ Keeping existing saturation (${currentCompetitors} competitors, ${currentIdea.saturation?.level}) - new has ${newCompetitors}, ${newSaturation.level}`)
        }
      } else if (newSaturation) {
        console.warn(`⚠️ New saturation data is invalid, keeping existing`)
      }

      // Only update if something actually changed
      if (updatedValidation !== currentIdea.validation || updatedSaturation !== currentIdea.saturation) {
        const updatedIdea = {
          ...currentIdea,
          validation: updatedValidation,
          saturation: updatedSaturation
        }
        
        console.log(`📝 Updating idea ${ideaId}:`, {
          before: {
            competitors: currentIdea.validation?.aggregatedScore?.totalCompetitors || 0,
            saturation: currentIdea.saturation?.level || 'none',
            status: currentIdea.validation?.status || 'none'
          },
          after: {
            competitors: updatedIdea.validation?.aggregatedScore?.totalCompetitors || 0,
            saturation: updatedIdea.saturation?.level || 'none',
            status: updatedIdea.validation?.status || 'none'
          }
        })
        
        // Replace the idea in a new array to maintain reactivity in Vue 3
        const updatedLeads = [...this.leads]
        updatedLeads[ideaIndex] = updatedIdea
        this.leads = updatedLeads
        console.log(`✅ Updated validation for idea ${ideaId}`)
      } else {
        console.log(`ℹ️ No update needed for idea ${ideaId} - existing data is better or same`)
      }
    }
  }
}
</script>

