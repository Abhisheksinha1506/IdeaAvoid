<template>
  <div class="privacy-policy">
    <div class="privacy-content">
      <div class="privacy-section">
        <h3>We Do NOT Collect or Store Your Data</h3>
        <p>
          <strong>IdeaAvoid respects your privacy.</strong> We do not collect, store, or mine your search queries, ideas, or any personal information.
        </p>
      </div>

      <div class="privacy-section">
        <h3>What We Do</h3>
        <ul>
          <li>All searches are performed locally in your browser</li>
          <li>No data is sent to our servers for tracking or analytics</li>
          <li>No cookies are used for tracking purposes</li>
          <li>We do NOT mine user input for ideas</li>
          <li>This is a read-only database - we don't collect your ideas</li>
        </ul>
      </div>

      <div class="privacy-section">
        <h3>What We Store</h3>
        <p>
          <strong>Server-Side:</strong>
        </p>
        <ul>
          <li>Visitor count (aggregated, stored on server for the visitor counter feature)</li>
          <li>IP addresses (for unique visitor tracking only, not linked to personal information)</li>
          <li>User contributions (if you choose to submit verification data or competitor information)</li>
        </ul>
        <p>
          <strong>Client-Side (Your Browser):</strong>
        </p>
        <ul>
          <li>No data is stored in your browser's localStorage</li>
          <li>No personal information is stored</li>
          <li>No search history is stored</li>
          <li>No ideas are stored</li>
        </ul>
      </div>

      <div class="privacy-section">
        <h3>User Contributions</h3>
        <p>
          If you choose to contribute verification data or competitor information, we store:
        </p>
        <ul>
          <li>Your contribution (verification, competitor link, etc.)</li>
          <li>Your IP address (for spam prevention only)</li>
          <li>Timestamp of your contribution</li>
        </ul>
        <p>
          <strong>We do NOT store:</strong> Your name, email, or any other personal information.
        </p>
      </div>

      <div class="privacy-section">
        <h3>Third-Party Services</h3>
        <p>
          We use third-party services for validation (Google Search via Puppeteer). These services:
        </p>
        <ul>
          <li>Are accessed server-side only</li>
          <li>Do not track individual users</li>
          <li>Are used solely for idea validation</li>
        </ul>
      </div>

      <div class="privacy-section">
        <h3>Contact</h3>
        <p>
          If you have questions about our privacy policy, please contact us at:
          <a href="mailto:abhisheksinha1594@gmail.com">abhisheksinha1594@gmail.com</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrivacyPolicy'
}
</script>

<style scoped>
.privacy-policy {
  max-width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}

.privacy-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.privacy-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.privacy-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.privacy-section:first-child h3 {
  margin-top: 0;
}

.privacy-section p {
  line-height: 1.6;
  color: var(--text-secondary, #6b7280);
}

.privacy-section ul {
  list-style: disc;
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.privacy-section li {
  line-height: 1.6;
  color: var(--text-secondary, #6b7280);
}

.privacy-section a {
  color: var(--primary-color, #2563eb);
  text-decoration: none;
}

.privacy-section a:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .privacy-policy {
    padding: 0;
  }
}
</style>

