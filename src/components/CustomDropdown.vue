<template>
  <div class="custom-dropdown" :class="{ 'is-open': isOpen, 'has-value': modelValue }" ref="dropdown">
    <div class="dropdown-trigger" @click="toggleDropdown" tabindex="0" @keydown.enter="toggleDropdown" @keydown.escape="closeDropdown">
      <span class="dropdown-value">
        {{ displayValue || placeholder }}
      </span>
      <span class="dropdown-arrow" :class="{ 'is-open': isOpen }">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L1 4H11L6 9Z" fill="currentColor"/>
        </svg>
      </span>
    </div>
    <div v-if="isOpen" class="dropdown-menu">
      <div v-if="searchable" class="dropdown-search">
        <input
          type="text"
          class="dropdown-search-input"
          :placeholder="searchPlaceholder"
          v-model="searchQuery"
          @click.stop
          @keydown.escape="closeDropdown"
          ref="searchInput"
        />
      </div>
      <div class="dropdown-options" ref="optionsContainer">
        <div
          v-for="option in filteredOptions"
          :key="getOptionValue(option)"
          class="dropdown-option"
          :class="{ 'is-selected': isSelected(option) }"
          @click="selectOption(option)"
        >
          {{ getOptionLabel(option) }}
        </div>
        <div v-if="filteredOptions.length === 0" class="dropdown-empty">
          {{ searchQuery ? 'No options found' : 'No options available' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomDropdown',
  props: {
    modelValue: {
      type: [String, Number],
      default: null
    },
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Select an option'
    },
    optionLabel: {
      type: String,
      default: 'label'
    },
    optionValue: {
      type: String,
      default: 'value'
    },
    searchable: {
      type: Boolean,
      default: false
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...'
    }
  },
  data() {
    return {
      isOpen: false,
      searchQuery: ''
    }
  },
  watch: {
    isOpen(newValue) {
      if (newValue && this.searchable) {
        this.$nextTick(() => {
          if (this.$refs.searchInput) {
            this.$refs.searchInput.focus()
          }
        })
      } else {
        this.searchQuery = ''
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  computed: {
    displayValue() {
      if (this.modelValue === null || this.modelValue === '') {
        return null
      }
      
      const option = this.options.find(opt => this.getOptionValue(opt) === this.modelValue)
      return option ? this.getOptionLabel(option) : null
    },
    filteredOptions() {
      if (!this.searchable || !this.searchQuery) {
        return this.options
      }
      
      const query = this.searchQuery.toLowerCase().trim()
      return this.options.filter(option => {
        const label = this.getOptionLabel(option).toLowerCase()
        return label.includes(query)
      })
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    closeDropdown() {
      this.isOpen = false
    },
    handleClickOutside(event) {
      if (this.$refs.dropdown && !this.$refs.dropdown.contains(event.target)) {
        this.isOpen = false
      }
    },
    selectOption(option) {
      const value = this.getOptionValue(option)
      this.$emit('update:modelValue', value)
      this.searchQuery = ''
      this.isOpen = false
    },
    isSelected(option) {
      return this.getOptionValue(option) === this.modelValue
    },
    getOptionLabel(option) {
      if (typeof option === 'string' || typeof option === 'number') {
        return option
      }
      return option[this.optionLabel] || option.label || option
    },
    getOptionValue(option) {
      if (typeof option === 'string' || typeof option === 'number') {
        return option
      }
      return option[this.optionValue] || option.value || option
    }
  }
}
</script>

<style scoped>
.custom-dropdown {
  position: relative;
  width: 100%;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  min-height: 42px;
  font-family: 'Inter', sans-serif;
}

.dropdown-trigger:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.custom-dropdown.is-open .dropdown-trigger {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.dropdown-value {
  flex: 1;
  text-align: left;
  color: var(--text-primary);
}

.custom-dropdown:not(.has-value) .dropdown-value {
  color: var(--text-secondary);
}

.dropdown-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  color: var(--text-secondary);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.dropdown-arrow.is-open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-search {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.dropdown-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  background: #ffffff;
  color: var(--text-primary);
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.dropdown-search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.dropdown-options {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Custom scrollbar styling */
.dropdown-options::-webkit-scrollbar {
  width: 8px;
}

.dropdown-options::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 4px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.dropdown-options::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

.dropdown-option {
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.15s;
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  font-family: 'Inter', sans-serif;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.dropdown-option.is-selected {
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: 600;
}

.dropdown-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

/* Responsive */
@media (max-width: 640px) {
  .dropdown-trigger {
    padding: 0.625rem;
    min-height: 38px;
    font-size: 0.8rem;
  }

  .dropdown-menu {
    max-width: 100vw;
  }

  .dropdown-options {
    max-height: 250px;
  }

  .dropdown-option {
    padding: 0.625rem 0.875rem;
    font-size: 0.8rem;
  }

  .dropdown-search {
    padding: 0.625rem;
  }

  .dropdown-search-input {
    padding: 0.5rem 0.625rem;
    font-size: 0.8rem;
  }
}
</style>

