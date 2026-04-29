import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel'; // Importar adaptador

export default defineConfig({
  output: 'server', // <--- CAMBIO CRUCIAL: Cambia de static a server
  adapter: vercel(), // <--- Añadir el adaptador
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
