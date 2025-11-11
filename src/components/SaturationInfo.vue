<template>
  <div class="saturation-info">
    <section class="info-section">
      <h4>📊 Saturation Level</h4>
      <p>The saturation level indicates how competitive a market is based on the number of similar implementations found:</p>
      <ul>
        <li><strong>Low:</strong> Less than 10 competitors - Market has room for new entrants</li>
        <li><strong>Medium:</strong> 10-49 competitors - Moderate competition, some opportunity</li>
        <li><strong>High:</strong> 50+ competitors - Highly saturated market, difficult to enter</li>
      </ul>
      <div class="code-block">
        <code>
if (competitorCount >= 50) → "high"<br>
else if (competitorCount >= 10) → "medium"<br>
else → "low"
        </code>
      </div>
    </section>

    <section class="info-section">
      <h4>👥 Competitor Count</h4>
      <p>The competitor count is determined by analyzing similar ideas using multiple validation sources:</p>
      
      <div class="sub-section">
        <h5>1. Internal Database Validation</h5>
        <p>Compares the idea against all other ideas in our database using:</p>
        <ul>
          <li><strong>Name Similarity (40% weight):</strong> Uses Dice coefficient to compare idea names</li>
          <li><strong>Description Similarity (30% weight):</strong> Compares idea descriptions</li>
          <li><strong>Tag Overlap (20% weight):</strong> Jaccard similarity of tags</li>
          <li><strong>Keyword Matching (10% weight):</strong> TF-IDF-like keyword extraction and matching</li>
        </ul>
        <p><strong>Similarity Threshold:</strong> Ideas with similarity score > 0.3 (30%) are considered similar</p>
        <p><strong>Result Limit:</strong> Maximum of 10 similar ideas are returned</p>
        <div class="code-block">
          <code>
similarity = (nameScore × 0.4) + (descScore × 0.3) + (tagScore × 0.2) + (keywordScore × 0.1)<br>
if (similarity > 0.3) → counted as competitor
          </code>
        </div>
      </div>

      <div class="sub-section">
        <h5>2. Google Search Validation (Optional)</h5>
        <p>Uses Puppeteer to search Google for existing implementations:</p>
        <ul>
          <li>Searches for the idea name and description</li>
          <li>Extracts relevant results (apps, software, platforms, services)</li>
          <li>Counts how many relevant competitors exist</li>
          <li>Results are cached for 24 hours to avoid repeated searches</li>
        </ul>
        <p><strong>Note:</strong> Google validation can be disabled via environment variable</p>
      </div>

      <div class="sub-section">
        <h5>3. Aggregated Score</h5>
        <p>The final competitor count is calculated from all sources:</p>
        <ul>
          <li><strong>Internal validation:</strong> 30% confidence weight</li>
          <li><strong>Google validation:</strong> 70% confidence weight</li>
          <li>Uses the maximum competitor count from all sources (most accurate)</li>
        </ul>
      </div>
    </section>

    <section class="info-section">
      <h4>🌊 Market Type (Blue Ocean vs Red Ocean)</h4>
      <p>Based on the "Blue Ocean Strategy" framework:</p>
      <ul>
        <li><strong>Blue Ocean:</strong> Less than 20 competitors - Untapped market space with less competition</li>
        <li><strong>Red Ocean:</strong> 20+ competitors - Highly competitive, saturated market</li>
      </ul>
      <div class="code-block">
        <code>
if (competitorCount >= 20) → "red ocean"<br>
else → "blue ocean"
        </code>
      </div>
      <div class="note-box">
        <strong>💡 Note:</strong> Blue ocean doesn't guarantee success - it just means less direct competition. The market might be small or unproven.
      </div>
    </section>

    <section class="info-section">
      <h4>💰 TAM (Total Addressable Market)</h4>
      <p>TAM is estimated based on competitor count - more competitors typically indicate a larger market:</p>
      <ul>
        <li><strong>$10M+:</strong> 1-9 competitors - Niche or emerging market</li>
        <li><strong>$50M+:</strong> 10-19 competitors - Growing market</li>
        <li><strong>$100M+:</strong> 20-49 competitors - Established market</li>
        <li><strong>$500M+:</strong> 50-99 competitors - Large market</li>
        <li><strong>$1B+:</strong> 100+ competitors - Very large market</li>
      </ul>
      <div class="code-block">
        <code>
if (competitorCount >= 100) → "$1B+"<br>
else if (competitorCount >= 50) → "$500M+"<br>
else if (competitorCount >= 20) → "$100M+"<br>
else if (competitorCount >= 10) → "$50M+"<br>
else → "$10M+"
        </code>
      </div>
      <div class="note-box warning">
        <strong>⚠️ Disclaimer:</strong> TAM is a rough estimate based on competitor count. Actual market size may vary significantly.
      </div>
    </section>

    <section class="info-section">
      <h4>🔄 Data Processing Flow</h4>
      <ol>
        <li><strong>Idea Input:</strong> Idea name, description, and tags are provided</li>
        <li><strong>Internal Validation:</strong> Compare against database of 29,322+ ideas</li>
        <li><strong>Similarity Calculation:</strong> Calculate similarity scores using multiple factors</li>
        <li><strong>Google Search (Optional):</strong> Search for existing implementations online</li>
        <li><strong>Aggregation:</strong> Combine results from all sources</li>
        <li><strong>Saturation Calculation:</strong> Determine level, market type, and TAM</li>
        <li><strong>Caching:</strong> Results cached for 24 hours to improve performance</li>
      </ol>
    </section>

    <section class="info-section">
      <h4>📝 Technical Details</h4>
      <div class="tech-details">
        <div class="detail-item">
          <strong>Similarity Algorithm:</strong> Dice coefficient (Sørensen–Dice) for string comparison
        </div>
        <div class="detail-item">
          <strong>Tag Similarity:</strong> Jaccard similarity coefficient
        </div>
        <div class="detail-item">
          <strong>Keyword Extraction:</strong> Natural language processing with stop word removal
        </div>
        <div class="detail-item">
          <strong>Cache Duration:</strong> 24 hours (86,400 seconds)
        </div>
        <div class="detail-item">
          <strong>Validation Sources:</strong> Internal database (always), Google search (optional)
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'SaturationInfo'
}
</script>

<style scoped>
.saturation-info {
  color: #374151;
  line-height: 1.6;
}

h4 {
  margin: 1.5rem 0 0.75rem 0;
  font-size: 1.125rem;
  color: #111827;
  font-weight: 600;
}

h4:first-of-type {
  margin-top: 0;
}

h5 {
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
  color: #374151;
  font-weight: 600;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section p {
  margin: 0.5rem 0;
  color: #6b7280;
}

.info-section ul,
.info-section ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
  color: #4b5563;
}

.info-section li {
  margin: 0.5rem 0;
}

.sub-section {
  margin: 1rem 0;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.code-block {
  background: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 6px;
  margin: 0.75rem 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}

.code-block code {
  color: #f9fafb;
  white-space: pre;
}

.note-box {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 6px;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.note-box.warning {
  background: #fef3c7;
  border-left-color: #f59e0b;
}

.tech-details {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.detail-item {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #10b981;
}

.detail-item strong {
  color: #111827;
  display: block;
  margin-bottom: 0.25rem;
}
</style>

