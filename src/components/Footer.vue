<template>
  <footer>
    <div class="container">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} IdeaAvoid. All rights reserved.</p>
        <div class="footer-links">
          <a href="#" @click.prevent="$emit('show-privacy')" class="footer-link">Privacy Policy</a>
          <span class="footer-separator">|</span>
          <p class="donation-message">
            Consider donating at 
            <a href="https://www.chai4.me/abhishekpaydev" target="_blank" rel="noopener noreferrer" class="donation-link">chai4.me/abhishekpaydev</a>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.footer-link {
  color: var(--text-secondary, #6b7280);
  text-decoration: none;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--primary-color, #2563eb);
}

.footer-separator {
  color: var(--text-secondary, #6b7280);
  margin: 0 0.5rem;
}

.donation-message {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  font-family: 'Inter', sans-serif;
}

.donation-link {
  color: var(--primary-color, #2563eb);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.donation-link:hover {
  color: var(--primary-dark, #1d4ed8);
  text-decoration: underline;
}

@media (max-width: 640px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .donation-message {
    font-size: 13px;
  }
}
</style>

