<template>
  <section class="hero">
    <div class="container">
      <div class="warning-banner">
        <strong>Warning:</strong> <span>These ideas have been implemented many times. This site exists to help you <strong>avoid</strong> over-saturated concepts, not to encourage building them.</span>
      </div>
      <h1>Ideas to Avoid: Over-Saturated Business Concepts</h1>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-number" v-if="!loading && uniqueTags > 0">
            {{ uniqueTags.toLocaleString() }}+
          </span>
          <span class="stat-number" v-else>...</span>
          <span class="stat-label">unique tags</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" v-if="!loading && ideasWithTags > 0">
            {{ ideasWithTags.toLocaleString() }}+
          </span>
          <span class="stat-number" v-else>...</span>
          <span class="stat-label">tagged ideas</span>
        </div>
        <div class="stat-item">
          <span class="stat-number" v-if="!loading && totalIdeas > 0">
            {{ totalIdeas.toLocaleString() }}+
          </span>
          <span class="stat-number" v-else>...</span>
          <span class="stat-label">over-saturated ideas to avoid</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  props: {
    totalIdeas: {
      type: Number,
      default: 0
    },
    uniqueTags: {
      type: Number,
      default: 0
    },
    ideasWithTags: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

