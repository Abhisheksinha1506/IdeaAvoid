<template>
  <div class="pagination" v-if="totalPages > 1">
    <div class="pagination-info">
      <span class="pagination-text">
        Showing {{ startItem }} - {{ endItem }} of {{ totalItems.toLocaleString() }} ideas
      </span>
    </div>
    <div class="pagination-controls">
      <button
        class="pagination-btn"
        :class="{ 'disabled': currentPage === 1 }"
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        title="First page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2L2 8L8 14M14 2L8 8L14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        class="pagination-btn"
        :class="{ 'disabled': currentPage === 1 }"
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        title="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2L4 8L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <div class="pagination-pages">
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            class="pagination-page"
            :class="{ 'active': page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="pagination-ellipsis">...</span>
        </template>
      </div>
      
      <button
        class="pagination-btn"
        :class="{ 'disabled': currentPage === totalPages }"
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        title="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2L12 8L6 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        class="pagination-btn"
        :class="{ 'disabled': currentPage === totalPages }"
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        title="Last page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2L8 8L2 14M10 2L16 8L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    totalItems: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      required: true
    }
  },
  computed: {
    startItem() {
      return ((this.currentPage - 1) * this.itemsPerPage) + 1
    },
    endItem() {
      const end = this.currentPage * this.itemsPerPage
      return end > this.totalItems ? this.totalItems : end
    },
    visiblePages() {
      const pages = []
      const maxVisible = 7
      
      if (this.totalPages <= maxVisible) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Show pages with ellipsis
        if (this.currentPage <= 3) {
          // Show first pages
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(this.totalPages)
        } else if (this.currentPage >= this.totalPages - 2) {
          // Show last pages
          pages.push(1)
          pages.push('...')
          for (let i = this.totalPages - 4; i <= this.totalPages; i++) {
            pages.push(i)
          }
        } else {
          // Show middle pages
          pages.push(1)
          pages.push('...')
          for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(this.totalPages)
        }
      }
      
      return pages
    }
  },
  methods: {
    goToPage(page) {
      if (page === '...' || page === this.currentPage) return
      if (page < 1 || page > this.totalPages) return
      this.$emit('page-change', page)
    }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  padding: 1.5rem 0;
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.pagination-info {
  width: 100%;
  text-align: center;
}

.pagination-text {
  color: var(--text-secondary);
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  font-family: 'Inter', sans-serif;
}

.pagination-btn:hover:not(.disabled) {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.pagination-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 16px;
  height: 16px;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-page {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}

.pagination-page:hover:not(.active) {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.pagination-page.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  font-weight: 600;
}

.pagination-page:disabled {
  cursor: default;
  pointer-events: none;
}

.pagination-ellipsis {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  user-select: none;
}

/* Responsive */
@media (max-width: 768px) {
  .pagination {
    padding: 1rem 0;
    margin-top: 1rem;
  }

  .pagination-controls {
    gap: 0.25rem;
    flex-wrap: wrap;
  }
  
  .pagination-btn,
  .pagination-page {
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 0 0.5rem;
    font-size: 0.75rem;
  }
  
  .pagination-pages {
    gap: 0.125rem;
  }

  .pagination-text {
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .pagination {
    padding: 0.75rem 0;
  }

  .pagination-info {
    margin-bottom: 0.5rem;
  }

  .pagination-text {
    font-size: 0.75rem;
  }

  .pagination-btn,
  .pagination-page {
    width: 28px;
    height: 28px;
    min-width: 28px;
    font-size: 0.7rem;
  }

  .pagination-btn svg {
    width: 14px;
    height: 14px;
  }

  .pagination-ellipsis {
    min-width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
}
</style>

