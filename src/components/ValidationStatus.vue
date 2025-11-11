<template>
  <div class="validation-status">
    <div class="validation-badge" :class="statusClass">
      <span class="status-icon">{{ statusIcon }}</span>
      <span class="status-text">{{ statusText }}</span>
    </div>
    <div class="validation-details" v-if="validation && validation.sources">
      <div class="sources-count" v-if="validation.sources.length > 0">
        {{ validation.sources.length }} source{{ validation.sources.length > 1 ? 's' : '' }} checked
      </div>
      <div class="competitor-count" v-if="validation.aggregatedScore && validation.aggregatedScore.totalCompetitors !== undefined">
        <span v-if="validation.aggregatedScore.totalCompetitors > 0">
          {{ validation.aggregatedScore.totalCompetitors }} competitor{{ validation.aggregatedScore.totalCompetitors > 1 ? 's' : '' }} found
        </span>
        <span v-else class="no-competitors">
          No competitors found (idea may not be over-saturated)
        </span>
      </div>
      <div class="last-checked" v-if="lastChecked">
        Last checked: {{ formatDate(lastChecked) }}
      </div>
    </div>
    <button 
      v-if="showVerifyButton" 
      @click="handleVerify" 
      class="verify-btn"
      :disabled="verifying"
    >
      {{ verifying ? 'Verifying...' : 'Verify Now' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'ValidationStatus',
  props: {
    validation: {
      type: Object,
      default: () => ({})
    },
    saturation: {
      type: Object,
      default: () => ({})
    },
    ideaId: {
      type: [String, Number],
      default: null
    },
    showVerifyButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      verifying: false
    }
  },
  computed: {
    status() {
      // Frontend logic: Show verified if competitors are found (regardless of confidence)
      // This provides better UX - if competitors exist, the idea is verified as over-saturated
      const totalCompetitors = this.validation.aggregatedScore?.totalCompetitors || 0;
      const hasSources = this.validation.sources && this.validation.sources.length > 0;
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 ValidationStatus - Computing status:', {
          totalCompetitors,
          hasSources,
          sourcesCount: this.validation.sources?.length || 0,
          backendStatus: this.validation.status,
          aggregatedScore: this.validation.aggregatedScore
        });
      }
      
      // If no competitors found, show unverified
      // Note: This is correct - if validation ran and found 0 competitors, the idea is not over-saturated
      if (totalCompetitors === 0) {
        // But if we have sources that checked, it means validation ran successfully
        // and found no competitors (which is different from "not validated yet")
        if (hasSources) {
          // Validation ran but found 0 competitors - this is actually a good sign (not over-saturated)
          // But for this app's purpose, we show it as "unverified" since we're looking for over-saturated ideas
          return 'unverified';
        }
        // No sources means validation hasn't run yet
        return 'unverified';
      }
      
      // If competitors are found and we have validation sources, show as verified
      // This overrides backend "pending" status when competitors exist
      if (totalCompetitors > 0 && hasSources) {
        return 'verified';
      }
      
      // Fallback to backend status if available
      const backendStatus = this.validation.status;
      if (backendStatus && ['verified', 'pending', 'unverified'].includes(backendStatus)) {
        // Only use backend status if it's verified or unverified
        // Don't use "pending" if we have competitors
        if (backendStatus === 'verified' || backendStatus === 'unverified') {
          return backendStatus;
        }
      }
      
      return 'unverified';
    },
    statusClass() {
      return {
        'verified': this.status === 'verified',
        'unverified': this.status === 'unverified',
        'pending': this.status === 'pending'
      };
    },
    statusIcon() {
      if (this.status === 'verified') return '✓';
      if (this.status === 'pending') return '⏳';
      return '⚠';
    },
    statusText() {
      if (this.status === 'verified') return 'Verified';
      if (this.status === 'pending') return 'Pending';
      return 'Unverified';
    },
    lastChecked() {
      // Check multiple sources for the date in priority order
      // Priority: validation.lastChecked > sources[0].lastChecked > saturation.lastVerified
      const validationDate = this.validation.lastChecked;
      const sourceDate = this.validation.sources?.[0]?.lastChecked;
      const saturationDate = this.saturation?.lastVerified;
      
      // Return the most recent valid date
      const dates = [validationDate, sourceDate, saturationDate].filter(d => d);
      if (dates.length === 0) return null;
      
      // Find the most recent date
      const validDates = dates
        .map(d => {
          try {
            const date = new Date(d);
            return isNaN(date.getTime()) ? null : date;
          } catch {
            return null;
          }
        })
        .filter(d => d !== null);
      
      if (validDates.length === 0) return null;
      
      // Return the most recent date as ISO string
      const mostRecent = new Date(Math.max(...validDates.map(d => d.getTime())));
      return mostRecent.toISOString();
    }
  },
  methods: {
    handleVerify() {
      this.verifying = true;
      this.$emit('verify', this.ideaId);
      // Reset verifying state after a reasonable timeout (10 seconds)
      // This prevents the button from being stuck if validation fails silently
      // In most cases, validation completes within 5-10 seconds
      setTimeout(() => {
        this.verifying = false;
      }, 10000);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      try {
      const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return '';
        // Format as MM/DD/YYYY
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      } catch (error) {
        console.error('Error formatting date:', error);
        return '';
      }
    }
  }
}
</script>

<style scoped>
.validation-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.validation-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.validation-badge.verified {
  background: #d1fae5;
  color: #065f46;
}

.validation-badge.unverified {
  background: #fee2e2;
  color: #991b1b;
}

.validation-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-icon {
  font-size: 1rem;
}

.validation-details {
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
}

.sources-count {
  font-weight: 500;
}

.competitor-count {
  font-weight: 500;
  margin-top: 0.25rem;
}

.competitor-count .no-competitors {
  color: #059669; /* green-600 - positive message */
  font-style: italic;
}

.last-checked {
  opacity: 0.8;
}

.verify-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background: white;
  color: var(--text-primary, #111827);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.verify-btn:hover:not(:disabled) {
  background: var(--bg-secondary, #f9fafb);
  border-color: var(--primary-color, #2563eb);
  color: var(--primary-color, #2563eb);
}

.verify-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

