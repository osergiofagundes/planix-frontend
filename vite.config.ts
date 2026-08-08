import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Definida no compose.dev.yaml. Fora do container nada disso se aplica.
const emDocker = process.env.DOCKER_DEV === "true"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // host: sem isso o dev server só aceita conexões de dentro do container.
  // usePolling: o bind mount do Windows não propaga eventos de inotify para o
  // Linux, então sem polling o HMR nunca dispara.
  server: emDocker
    ? { host: true, watch: { usePolling: true, interval: 300 } }
    : undefined,
})
