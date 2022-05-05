<template>
  <div>
    Nuxt module playground!
    {{ x }}
  </div>
</template>

<script setup>
const x = ref(process.env.teste)
</script>
