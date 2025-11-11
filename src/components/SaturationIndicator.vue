<template>
  <div class="saturation-indicator">
    <div class="saturation-badge" :class="saturationClass">
      <span class="saturation-level">{{ saturationLevel }}</span>
      <span class="saturation-label">Saturation</span>
    </div>
    <div class="saturation-details" v-if="saturation">
      <div class="detail-item" v-if="competitorCount !== null && competitorCount !== undefined">
        <span class="detail-label">Competitors:</span>
        <span class="detail-value">{{ competitorCount }}</span>
      </div>
      <div class="detail-item" v-if="tam">
        <span class="detail-label">TAM:</span>
        <span class="detail-value">{{ tam }}</span>
      </div>
      <div class="detail-item" v-if="marketType">
        <span class="detail-label">Market:</span>
        <span class="detail-value" :class="marketTypeClass">{{ marketType }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SaturationIndicator',
  props: {
    saturation: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    saturationLevel() {
      // Validate saturation level is one of the expected values
      const level = this.saturation.level;
      const validLevels = ['low', 'medium', 'high', 'unknown'];
      return validLevels.includes(level) ? level : 'unknown';
    },
    competitorCount() {
      // Ensure competitorCount is a valid number
      const count = this.saturation.competitorCount;
      if (count === null || count === undefined) return null;
      const numCount = Number(count);
      return isNaN(numCount) ? null : Math.max(0, Math.floor(numCount));
    },
    tam() {
      // Validate TAM format
      const tam = this.saturation.tam;
      if (!tam || typeof tam !== 'string') return null;
      // TAM should be in format like "$10M+", "$50M+", etc.
      return tam.trim();
    },
    marketType() {
      // Validate market type
      const marketType = this.saturation.marketType;
      const validTypes = ['blue ocean', 'red ocean'];
      return validTypes.includes(marketType) ? marketType : null;
    },
    saturationClass() {
      return {
        'high': this.saturationLevel === 'high',
        'medium': this.saturationLevel === 'medium',
        'low': this.saturationLevel === 'low',
        'unknown': this.saturationLevel === 'unknown'
      };
    },
    marketTypeClass() {
      return {
        'red-ocean': this.marketType === 'red ocean',
        'blue-ocean': this.marketType === 'blue ocean'
      };
    }
  }
}
</script>

<style scoped>
.saturation-indicator {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.saturation-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}

.saturation-badge.high {
  background: #fee2e2;
  color: #991b1b;
}

.saturation-badge.medium {
  background: #fef3c7;
  color: #92400e;
}

.saturation-badge.low {
  background: #d1fae5;
  color: #065f46;
}

.saturation-badge.unknown {
  background: #f3f4f6;
  color: #6b7280;
}

.saturation-level {
  text-transform: capitalize;
}

.saturation-label {
  font-weight: 400;
  opacity: 0.8;
}

.saturation-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary, #6b7280);
}

.detail-item {
  display: flex;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
}

.detail-value.red-ocean {
  color: #dc2626;
}

.detail-value.blue-ocean {
  color: #059669;
}
</style>

