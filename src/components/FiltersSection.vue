<template>
  <section class="filters-section">
    <div class="container">
      <div class="filters-row">
        <div class="filter-group search-group">
          <input
            type="text"
            class="search-input"
            placeholder="Search over-saturated ideas to avoid..."
            :value="localFilters.search"
            @input="handleSearch"
          />
        </div>
        <div class="filter-group">
          <CustomDropdown
            :model-value="localFilters.tag"
            @update:model-value="handleTagChange"
            :options="tagOptions"
            placeholder="Search tags..."
            :searchable="true"
            search-placeholder="Search tags..."
          />
        </div>
        <div class="filter-group">
          <CategoryFilter
            :model-value="localFilters.category"
            @update:model-value="handleCategoryChange"
          />
        </div>
        <div class="filter-group">
          <CustomDropdown
            :model-value="localFilters.itemsPerPage"
            @update:model-value="handleItemsPerPageChange"
            :options="itemsPerPageOptions"
            placeholder="Select items per page"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import CustomDropdown from './CustomDropdown.vue'
import CategoryFilter from './CategoryFilter.vue'

export default {
  name: 'FiltersSection',
  components: {
    CustomDropdown,
    CategoryFilter
  },
  props: {
    filters: {
      type: Object,
      required: true
    },
    availableTags: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localFilters: {
        search: '',
        tag: '',
        category: '',
        itemsPerPage: 25
      },
      itemsPerPageOptions: [
        { value: 10, label: '10 ideas per page' },
        { value: 25, label: '25 ideas per page' },
        { value: 50, label: '50 ideas per page' },
        { value: 75, label: '75 ideas per page' },
        { value: 100, label: '100 ideas per page' }
      ]
    }
  },
  computed: {
    sortedTags() {
      return [...this.availableTags].sort()
    },
    tagOptions() {
      // Filter tags based on search query if available
      let tags = this.sortedTags
      
      if (this.localFilters.search) {
        const searchLower = this.localFilters.search.toLowerCase()
        tags = tags.filter(tag => 
          tag.toLowerCase().includes(searchLower)
        )
      }
      
      return tags.map(tag => ({ value: tag, label: tag }))
    }
  },
  watch: {
    filters: {
      handler(newFilters) {
        this.localFilters = { ...newFilters }
      },
      immediate: true,
      deep: true
    },
    tagOptions: {
      handler(newOptions) {
        // If selected tag is no longer in available options, clear it
        if (this.localFilters.tag) {
          const tagExists = newOptions.some(option => option.value === this.localFilters.tag)
          if (!tagExists) {
            this.localFilters.tag = ''
            this.updateFilters()
          }
        }
      }
    }
  },
  methods: {
    handleSearch(event) {
      this.localFilters.search = event.target.value
      this.updateFilters()
    },
    handleTagChange(value) {
      this.localFilters.tag = value
      this.updateFilters()
    },
    handleCategoryChange(value) {
      this.localFilters.category = value
      this.updateFilters()
    },
    handleItemsPerPageChange(value) {
      this.localFilters.itemsPerPage = value
      this.updateFilters()
    },
    updateFilters() {
      this.$emit('update-filters', this.localFilters)
    }
  }
}
</script>

