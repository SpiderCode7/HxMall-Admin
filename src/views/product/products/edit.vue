<template>
  <ProductForm mode="edit" :product-id="route.params.id" />
</template>

<script setup>
import { useRoute } from 'vue-router'
import ProductForm from './components/ProductForm.vue'

const route = useRoute()
</script>