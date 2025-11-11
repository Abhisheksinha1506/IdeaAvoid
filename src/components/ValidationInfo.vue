<template>
  <div class="validation-info">
    <section class="info-section">
      <h4>✅ Validation Status</h4>
      <p>The validation status indicates whether competitors have been found for an idea:</p>
      <ul>
        <li><strong>Verified:</strong> Competitors have been found - the idea is confirmed as over-saturated. This status appears when any competitors are detected, regardless of confidence level.</li>
        <li><strong>Unverified:</strong> No competitors found or validation not yet performed - the idea may be unique or hasn't been checked yet.</li>
      </ul>
      <div class="code-block">
        <code>
if (totalCompetitors === 0) → "unverified"<br>
else if (totalCompetitors > 0 && hasSources) → "verified"<br>
else → "unverified"
        </code>
      </div>
      <div class="note-box">
        <strong>💡 Note:</strong> The confidence level (0.3 for internal validation, 0.7 for Google validation) indicates the <em>quality</em> of the validation source, not whether competitors exist. If competitors are found from any source, the idea is marked as "Verified" to clearly indicate it's over-saturated.
      </div>
    </section>

    <section class="info-section">
      <h4>🔍 Validation Sources</h4>
      <p>Ideas are validated using multiple sources to ensure accuracy:</p>
      
      <div class="sub-section">
        <h5>1. Internal Database Validation</h5>
        <p>Compares the idea against our database of 29,322+ over-saturated ideas:</p>
        <ul>
          <li><strong>Algorithm:</strong> Multi-factor similarity calculation</li>
          <li><strong>Name Similarity (40%):</strong> Dice coefficient string comparison</li>
          <li><strong>Description Similarity (30%):</strong> Text comparison using Dice coefficient</li>
          <li><strong>Tag Overlap (20%):</strong> Jaccard similarity of tag sets</li>
          <li><strong>Keyword Matching (10%):</strong> TF-IDF-like keyword extraction and matching</li>
        </ul>
        <div class="code-block">
          <code>
// Calculate similarity score<br>
nameScore = diceCoefficient(idea1.name, idea2.name)<br>
descScore = diceCoefficient(idea1.description, idea2.description)<br>
tagScore = jaccardSimilarity(idea1.tags, idea2.tags)<br>
keywordScore = keywordOverlap(idea1, idea2)<br>
<br>
finalScore = (nameScore × 0.4) + (descScore × 0.3) + <br>
             (tagScore × 0.2) + (keywordScore × 0.1)
          </code>
        </div>
        <p><strong>Similarity Threshold:</strong> 0.3 (30% similarity required)</p>
        <p><strong>Result Limit:</strong> Top 10 most similar ideas</p>
        <p><strong>Confidence Weight:</strong> 30% (internal validation has lower confidence than external sources)</p>
      </div>

      <div class="sub-section">
        <h5>2. Google Search Validation (Optional)</h5>
        <p>Uses automated browser (Puppeteer) to search Google for existing implementations:</p>
        <ul>
          <li><strong>Search Query:</strong> Idea name + description (first 50 chars)</li>
          <li><strong>Method:</strong> Headless Chrome browser automation</li>
          <li><strong>Results Analyzed:</strong> Top 10 Google search results</li>
          <li><strong>Relevance Filter:</strong> Results must contain idea name or keywords (app, software, platform, service)</li>
          <li><strong>Caching:</strong> Results cached for 24 hours</li>
        </ul>
        <div class="code-block">
          <code>
searchQuery = "\"" + ideaName + "\" " + description.substring(0, 50)<br>
googleResults = searchGoogle(searchQuery)<br>
relevantResults = filter(results, contains(ideaName) || <br>
                        contains("app") || contains("software") || <br>
                        contains("platform") || contains("service"))<br>
competitorCount = relevantResults.length
          </code>
        </div>
        <p><strong>Confidence Weight:</strong> 70% (external validation has higher confidence)</p>
        <p><strong>Note:</strong> Can be disabled via <code>GOOGLE_SEARCH_ENABLED</code> environment variable</p>
      </div>
    </section>

    <section class="info-section">
      <h4>📊 Aggregated Score Calculation</h4>
      <p>Results from all sources are combined into a single aggregated score:</p>
      <ul>
        <li><strong>Total Competitors:</strong> Maximum competitor count from all sources (uses the most accurate source)</li>
        <li><strong>Average Similarity:</strong> Average similarity score from internal validation (0-1 scale)</li>
        <li><strong>Confidence:</strong> Weighted confidence based on source quality (indicates validation reliability, not competitor existence)</li>
        <li><strong>Sources Count:</strong> Number of validation sources used (1 = internal only, 2 = internal + Google)</li>
      </ul>
      <div class="code-block">
        <code>
// Confidence calculation<br>
confidence = 0<br>
if (internalValidation) {<br>
  confidence += 0.3  // Internal validation: 30% confidence<br>
  totalCompetitors = max(totalCompetitors, internalValidation.similarIdeas)<br>
}<br>
if (googleValidation) {<br>
  confidence += 0.7  // Google validation: 70% confidence<br>
  totalCompetitors = max(totalCompetitors, googleValidation.competitorCount)<br>
}<br>
confidence = min(confidence, 1.0) // Cap at 100%<br>
<br>
// Status determination<br>
if (totalCompetitors > 0 && hasSources) → "verified"<br>
else → "unverified"
          </code>
        </div>
      <div class="note-box">
        <strong>📌 Important:</strong> The competitor count uses the <em>maximum</em> value from all sources (not the sum) to ensure accuracy. Confidence level indicates how reliable the validation is, but doesn't affect the "Verified" status - any found competitors result in "Verified" status.
      </div>
    </section>

    <section class="info-section">
      <h4>🎯 Similarity Algorithms Explained</h4>
      
      <div class="sub-section">
        <h5>Dice Coefficient (Sørensen–Dice)</h5>
        <p>Measures similarity between two strings:</p>
        <div class="code-block">
          <code>
dice = (2 × |bigrams(string1) ∩ bigrams(string2)|) / <br>
       (|bigrams(string1)| + |bigrams(string2)|)<br>
<br>
Example:<br>
"App Store" vs "App Store Manager"<br>
bigrams("App Store") = ["Ap", "pp", "p ", " S", "St", "to", "or", "re"]<br>
bigrams("App Store Manager") = ["Ap", "pp", "p ", " S", "St", "to", "or", "re", "e ", " M", ...]<br>
intersection = 8, union = 8 + 11 = 19<br>
dice = (2 × 8) / 19 = 0.84 (84% similar)
          </code>
        </div>
      </div>

      <div class="sub-section">
        <h5>Jaccard Similarity</h5>
        <p>Measures overlap between two sets (used for tags):</p>
        <div class="code-block">
          <code>
jaccard = |set1 ∩ set2| / |set1 ∪ set2|<br>
<br>
Example:<br>
tags1 = ["AI", "Mobile", "Web"]<br>
tags2 = ["AI", "Mobile", "Design"]<br>
intersection = {"AI", "Mobile"} = 2<br>
union = {"AI", "Mobile", "Web", "Design"} = 4<br>
jaccard = 2 / 4 = 0.5 (50% similar)
          </code>
        </div>
      </div>

      <div class="sub-section">
        <h5>Keyword Extraction</h5>
        <p>Uses natural language processing to extract meaningful keywords:</p>
        <ul>
          <li>Tokenizes text into words</li>
          <li>Removes stop words (the, a, an, and, or, but, etc.)</li>
          <li>Filters words shorter than 3 characters</li>
          <li>Extracts top 20 keywords</li>
          <li>Compares keyword overlap between ideas</li>
        </ul>
      </div>
    </section>

    <section class="info-section">
      <h4>⚡ Performance Optimizations</h4>
      <ul>
        <li><strong>Caching:</strong> Validation results cached for 24 hours to avoid redundant calculations</li>
        <li><strong>Indexing:</strong> Ideas indexed by ID, tags, and categories for fast lookup</li>
        <li><strong>Parallel Processing:</strong> Multiple validation sources can run concurrently</li>
        <li><strong>Early Termination:</strong> Stops searching once similarity threshold is met</li>
      </ul>
    </section>

    <section class="info-section">
      <h4>📝 Validation Data Structure</h4>
      <div class="code-block">
        <code>
{<br>
  "validation": {<br>
    "status": "verified" | "unverified",<br>
    "sources": [<br>
      {<br>
        "source": "internal_database" | "google",<br>
        "similarIdeas": 10,        // Internal: count of similar ideas<br>
        "competitorCount": 10,      // Google: count of competitors<br>
        "similarityScore": 0.45,    // Internal: average similarity (0-1)<br>
        "competitors": [...],       // Top similar ideas with scores<br>
        "lastChecked": "2025-11-10T13:45:01.347Z"<br>
      }<br>
    ],<br>
    "aggregatedScore": {<br>
      "totalCompetitors": 10,       // Max from all sources<br>
      "avgSimilarity": 0.45,        // Average from internal validation<br>
      "confidence": 0.3,            // 0.3 = internal only, 1.0 = both sources<br>
      "sourcesCount": 1             // Number of sources used<br>
    }<br>
  }<br>
}
        </code>
      </div>
      <div class="note-box">
        <strong>📋 Status Values:</strong>
        <ul>
          <li><strong>"verified":</strong> Competitors found (totalCompetitors > 0)</li>
          <li><strong>"unverified":</strong> No competitors found (totalCompetitors === 0)</li>
        </ul>
        <p><strong>Note:</strong> "pending" status is no longer used. If competitors exist, status is "verified".</p>
      </div>
    </section>

    <section class="info-section">
      <h4>⚠️ Limitations & Disclaimers</h4>
      <div class="note-box warning">
        <ul>
          <li><strong>Validation Coverage:</strong> Validation is based on similarity matching - it may not catch all variations of an idea</li>
          <li><strong>Google Search Variability:</strong> Google search results depend on search engine algorithms and may vary over time</li>
          <li><strong>Similarity Threshold:</strong> Similarity threshold of 0.3 (30%) may be too low for some use cases - some matches may be false positives</li>
          <li><strong>Database Limitations:</strong> Internal database is limited to ideas in our collection (29,322+ ideas) - may miss competitors outside this dataset</li>
          <li><strong>Confidence Levels:</strong> Confidence indicates source quality (internal = 30%, Google = 70%) but doesn't affect verification status</li>
          <li><strong>Results are Estimates:</strong> All results are estimates and should not be considered definitive - use as a guide, not absolute truth</li>
          <li><strong>Data Freshness:</strong> Validation results are cached for 24 hours - newer competitors may not appear immediately</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'ValidationInfo'
}
</script>

<style scoped>
.validation-info {
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

.note-box.warning ul {
  margin: 0.5rem 0;
}
</style>

