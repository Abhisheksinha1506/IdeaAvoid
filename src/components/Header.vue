<template>
  <div class="donation-banner">
    <div class="container">
      <p class="donation-banner-text">
        Consider donating at 
        <a href="https://www.chai4.me/abhishekpaydev" target="_blank" rel="noopener noreferrer" class="donation-banner-link">chai4.me/abhishekpaydev</a>
      </p>
    </div>
  </div>
  <header>
    <div class="container">
      <div class="header-content">
        <a href="#" class="logo">IdeaAvoid</a>
        <nav class="nav-links">
          <VisitorCounter />
          <a href="mailto:abhisheksinha1594@gmail.com" class="nav-link">Feedback</a>
          <a href="mailto:abhisheksinha1594@gmail.com" class="nav-link">I am looking for a job</a>
        </nav>
      </div>
    </div>
  </header>
</template>

<script>
import VisitorCounter from './VisitorCounter.vue'

export default {
  name: 'Header',
  components: {
    VisitorCounter
  }
}
</script>

<style scoped>
.donation-banner {
  background: var(--primary-color, #2563eb);
  color: white;
  padding: 10px 0;
  text-align: center;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
}

.donation-banner-text {
  margin: 0;
  color: white;
}

.donation-banner-link {
  color: white;
  text-decoration: underline;
  font-weight: 600;
  transition: opacity 0.2s;
}

.donation-banner-link:hover {
  opacity: 0.9;
}

@media (max-width: 640px) {
  .donation-banner {
    font-size: 12px;
    padding: 8px 0;
  }
}
</style>

