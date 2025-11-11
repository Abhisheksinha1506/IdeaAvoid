<template>
  <div class="user-contribution">
    <div class="contribution-header">
      <h3>Help Improve This Idea</h3>
      <p>Your contributions help make this database more accurate</p>
    </div>

    <div class="contribution-forms">
      <!-- Verify Idea -->
      <div class="contribution-form">
        <h4>Verify This Idea</h4>
        <div class="form-group">
          <label>Does this idea exist in the market?</label>
          <div class="radio-group">
            <label>
              <input type="radio" v-model="verification.exists" value="true" />
              Yes, it exists
            </label>
            <label>
              <input type="radio" v-model="verification.exists" value="false" />
              No, it doesn't exist
            </label>
          </div>
        </div>
        <div class="form-group" v-if="verification.exists === 'true'">
          <label>Competitor Links (one per line)</label>
          <textarea 
            v-model="verification.competitorLinks" 
            placeholder="https://example.com&#10;https://another-example.com"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Notes (optional)</label>
          <textarea 
            v-model="verification.notes" 
            placeholder="Any additional information..."
            rows="2"
          ></textarea>
        </div>
        <button @click="submitVerification" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Submitting...' : 'Submit Verification' }}
        </button>
      </div>

      <!-- Report Competitor -->
      <div class="contribution-form">
        <h4>Report a Competitor</h4>
        <div class="form-group">
          <label>Competitor Name</label>
          <input type="text" v-model="competitor.name" placeholder="Competitor name" />
        </div>
        <div class="form-group">
          <label>Competitor Link</label>
          <input type="url" v-model="competitor.link" placeholder="https://example.com" />
        </div>
        <div class="form-group">
          <label>Notes (optional)</label>
          <textarea 
            v-model="competitor.notes" 
            placeholder="Any additional information..."
            rows="2"
          ></textarea>
        </div>
        <button @click="submitCompetitor" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Submitting...' : 'Submit Competitor' }}
        </button>
      </div>

      <!-- Report Saturation -->
      <div class="contribution-form">
        <h4>Report Saturation Level</h4>
        <div class="form-group">
          <label>Saturation Level</label>
          <select v-model="saturation.level">
            <option value="">Select level</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div class="form-group">
          <label>Estimated Competitor Count</label>
          <input type="number" v-model.number="saturation.competitorCount" placeholder="e.g., 50" />
        </div>
        <div class="form-group">
          <label>Notes (optional)</label>
          <textarea 
            v-model="saturation.notes" 
            placeholder="Any additional information..."
            rows="2"
          ></textarea>
        </div>
        <button @click="submitSaturation" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Submitting...' : 'Submit Saturation' }}
        </button>
      </div>
    </div>

    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { contributionsAPI } from '../data/apiClient'

export default {
  name: 'UserContribution',
  props: {
    ideaId: {
      type: [String, Number],
      default: null
    },
    ideaName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      verification: {
        exists: null,
        competitorLinks: '',
        notes: ''
      },
      competitor: {
        name: '',
        link: '',
        notes: ''
      },
      saturation: {
        level: '',
        competitorCount: null,
        notes: ''
      },
      submitting: false,
      message: '',
      messageType: 'success'
    }
  },
  methods: {
    async submitVerification() {
      if (this.verification.exists === null) {
        this.showMessage('Please select whether this idea exists', 'error')
        return
      }

      this.submitting = true
      try {
        const competitorLinks = this.verification.competitorLinks
          .split('\n')
          .map(link => link.trim())
          .filter(link => link.length > 0)

        await contributionsAPI.submitVerification({
          ideaId: this.ideaId,
          ideaName: this.ideaName,
          exists: this.verification.exists === 'true',
          competitorLinks: competitorLinks,
          notes: this.verification.notes
        })

        this.showMessage('Verification submitted successfully!', 'success')
        this.resetVerification()
      } catch (error) {
        this.showMessage('Failed to submit verification. Please try again.', 'error')
      } finally {
        this.submitting = false
      }
    },

    async submitCompetitor() {
      if (!this.competitor.name || !this.competitor.link) {
        this.showMessage('Please fill in competitor name and link', 'error')
        return
      }

      this.submitting = true
      try {
        await contributionsAPI.submitCompetitor({
          ideaId: this.ideaId,
          ideaName: this.ideaName,
          competitorName: this.competitor.name,
          competitorLink: this.competitor.link,
          notes: this.competitor.notes
        })

        this.showMessage('Competitor submitted successfully!', 'success')
        this.resetCompetitor()
      } catch (error) {
        this.showMessage('Failed to submit competitor. Please try again.', 'error')
      } finally {
        this.submitting = false
      }
    },

    async submitSaturation() {
      if (!this.saturation.level) {
        this.showMessage('Please select saturation level', 'error')
        return
      }

      this.submitting = true
      try {
        await contributionsAPI.submitSaturation({
          ideaId: this.ideaId,
          ideaName: this.ideaName,
          saturationLevel: this.saturation.level,
          competitorCount: this.saturation.competitorCount,
          notes: this.saturation.notes
        })

        this.showMessage('Saturation level submitted successfully!', 'success')
        this.resetSaturation()
      } catch (error) {
        this.showMessage('Failed to submit saturation. Please try again.', 'error')
      } finally {
        this.submitting = false
      }
    },

    resetVerification() {
      this.verification = {
        exists: null,
        competitorLinks: '',
        notes: ''
      }
    },

    resetCompetitor() {
      this.competitor = {
        name: '',
        link: '',
        notes: ''
      }
    },

    resetSaturation() {
      this.saturation = {
        level: '',
        competitorCount: null,
        notes: ''
      }
    },

    showMessage(text, type = 'success') {
      this.message = text
      this.messageType = type
      setTimeout(() => {
        this.message = ''
      }, 5000)
    }
  }
}
</script>

<style scoped>
.user-contribution {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-color, #e5e7eb);
  font-family: 'Inter', sans-serif;
}

.contribution-header {
  margin-bottom: 1.5rem;
}

.contribution-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #111827);
}

.contribution-header p {
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
}

.contribution-forms {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contribution-form {
  padding: 1rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: 6px;
}

.contribution-form h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary, #111827);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #111827);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: 'Inter', sans-serif;
}

.form-group textarea {
  resize: vertical;
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 400;
  cursor: pointer;
}

.submit-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color, #2563eb);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark, #1d4ed8);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.message.success {
  background: #d1fae5;
  color: #065f46;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
}
</style>

