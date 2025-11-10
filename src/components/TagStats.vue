<template>
  <section class="tag-stats-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Tag Distribution</h2>
        <div class="stats-summary">
          <span class="stat-item">
            <strong>{{ totalTags }}</strong> unique tags
          </span>
          <span class="stat-item">
            <strong>{{ totalIdeas }}</strong> total ideas
          </span>
        </div>
      </div>
      
      <div class="tag-stats-controls">
        <input
          type="text"
          class="search-input"
          placeholder="Search tags..."
          v-model="searchQuery"
        />
        <CustomDropdown
          :model-value="sortBy"
          @update:model-value="handleSortChange"
          :options="sortOptions"
          placeholder="Sort by"
        />
        <CustomDropdown
          :model-value="minCount"
          @update:model-value="handleMinCountChange"
          :options="minCountOptions"
          placeholder="Filter by count"
        />
      </div>
      
      <div class="tag-stats-grid">
        <div
          v-for="(tag, index) in filteredTags"
          :key="index"
          class="tag-stat-item"
        >
          <div class="tag-name">{{ tag.tag }}</div>
          <div class="tag-count">
            <span class="count-number">{{ tag.count }}</span>
            <span class="count-label">idea{{ tag.count !== 1 ? 's' : '' }}</span>
          </div>
          <div class="tag-bar">
            <div
              class="tag-bar-fill"
              :style="{ width: (tag.count / maxCount * 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredTags.length === 0" class="empty-state">
        No tags found matching your criteria.
      </div>
    </div>
  </section>
</template>

<script>
import CustomDropdown from './CustomDropdown.vue'

export default {
  name: 'TagStats',
  components: {
    CustomDropdown
  },
  props: {
    ideas: {
      type: Array,
      required: true
    },
    totalIdeas: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      searchQuery: '',
      sortBy: 'frequency',
      minCount: 1,
      sortOptions: [
        { value: 'frequency', label: 'Sort by Frequency' },
        { value: 'name', label: 'Sort by Name' }
      ],
      minCountOptions: [
        { value: 1, label: 'All Tags' },
        { value: 10, label: '10+ ideas' },
        { value: 50, label: '50+ ideas' },
        { value: 100, label: '100+ ideas' },
        { value: 500, label: '500+ ideas' }
      ]
    }
  },
  computed: {
    tagStats() {
      const stats = {}
      
      // Count how many ideas have each tag
      this.ideas.forEach(idea => {
        if (idea.tags && Array.isArray(idea.tags)) {
          idea.tags.forEach(tag => {
            if (tag && typeof tag === 'string' && tag.length > 0) {
              stats[tag] = (stats[tag] || 0) + 1
            }
          })
        }
      })
      
      return Object.entries(stats).map(([tag, count]) => ({
        tag,
        count
      }))
    },
    totalTags() {
      return this.tagStats.length
    },
    filteredTags() {
      let filtered = this.tagStats.filter(t => t.count >= this.minCount)
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(t => t.tag.toLowerCase().includes(query))
      }
      
      if (this.sortBy === 'frequency') {
        filtered.sort((a, b) => b.count - a.count)
      } else {
        filtered.sort((a, b) => a.tag.localeCompare(b.tag))
      }
      
      return filtered
    },
    maxCount() {
      if (this.filteredTags.length === 0) return 1
      return Math.max(...this.filteredTags.map(t => t.count))
    }
  },
  methods: {
    handleSortChange(value) {
      this.sortBy = value
      this.updateDisplay()
    },
    handleMinCountChange(value) {
      this.minCount = value
      this.updateDisplay()
    },
    updateDisplay() {
      // Trigger reactivity
    }
  }
}
</script>

<style scoped>
.tag-stats-section {
  padding: 3rem 0;
  background: var(--bg-secondary);
}

.stats-summary {
  display: flex;
  gap: 2rem;
}

.stat-item {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.stat-item strong {
  color: var(--primary-color);
  font-weight: 600;
}

.tag-stats-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  color: var(--text-primary);
  flex: 1;
  min-width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.tag-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.tag-stat-item {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s;
}

.tag-stat-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.tag-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.tag-count {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.count-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.count-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.tag-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.tag-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}
</style>

