<template>
  <div class="category-filter">
    <CustomDropdown
      :model-value="selectedCategory"
      @update:model-value="handleCategoryChange"
      :options="categoryOptions"
      placeholder="Filter by category"
    />
  </div>
</template>

<script>
import CustomDropdown from './CustomDropdown.vue'

export default {
  name: 'CategoryFilter',
  components: {
    CustomDropdown
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      categoryOptions: [
        { value: '', label: 'All Categories' },
        { value: 'tech', label: 'Tech/Software' },
        { value: 'business', label: 'Business Services' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'education', label: 'Education' },
        { value: 'finance', label: 'Finance' },
        { value: 'retail', label: 'Retail/E-commerce' },
        { value: 'food', label: 'Food & Beverage' },
        { value: 'travel', label: 'Travel' },
        { value: 'real-estate', label: 'Real Estate' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'other', label: 'Other' }
      ]
    }
  },
  computed: {
    selectedCategory() {
      return this.modelValue || ''
    }
  },
  methods: {
    handleCategoryChange(value) {
      this.$emit('update:modelValue', value)
      this.$emit('change', value)
    }
  }
}
</script>

<style scoped>
.category-filter {
  width: 100%;
}
</style>

