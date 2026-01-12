import tailwindcss from '@tailwindcss/vite'; // 1. 引入插件
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(), // 2. 注册插件
  ],
})