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
        :all-leads="leads"
        @page-change="handlePageChange"
        @download-csv="handleDownloadClick"
      />
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from './components/Header.vue'
import HeroSection from './components/HeroSection.vue'
import FiltersSection from './components/FiltersSection.vue'
import LeadsSection from './components/LeadsSection.vue'
import Footer from './components/Footer.vue'
import { loadIdeas, extractUniqueTags } from './data/loadIdeas'
import * as XLSX from 'xlsx'

export default {
  name: 'App',
  components: {
    Header,
    HeroSection,
    FiltersSection,
    LeadsSection,
    Footer
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
        itemsPerPage: 25
      },
      currentPage: 1
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
      // Directly download without payment check
      this.downloadCSV()
    },
    downloadCSV() {
      // Convert all ideas to Excel format with worksheet name "Avoid Data"
      const ideas = this.leads
      
      if (ideas.length === 0) {
        console.warn('No ideas to download')
        return
      }
      
      // Prepare data for Excel
      const excelData = ideas.map(idea => {
        return {
          'Name': idea.name || idea.title || '',
          'Description': idea.description || '',
          'Tags': Array.isArray(idea.tags) ? idea.tags.join('; ') : '',
          'Pain Points': Array.isArray(idea.painPoints) 
            ? idea.painPoints.map(pp => this.formatPainPoint(pp)).join('; ') 
            : ''
        }
      })
      
      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 30 }, // Name
        { wch: 60 }, // Description
        { wch: 40 }, // Tags
        { wch: 60 }  // Pain Points
      ]
      worksheet['!cols'] = columnWidths
      
      // Add worksheet to workbook with name "Avoid Data"
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Avoid Data')
      
      // Generate Excel file and download
      XLSX.writeFile(workbook, 'avoid_data.xlsx')
      
      console.log(`✅ Downloaded ${ideas.length} ideas as Excel file with worksheet "Avoid Data"`)
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
    }
  }
}
</script>

