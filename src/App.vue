<script setup lang="ts">
import Navbar from './presentation/components/Navbar.vue';
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <Navbar />
    <router-view></router-view>
  </div>
</template>