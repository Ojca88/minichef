import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

function getLastCommitDate() {
  try {
    // Fecha del último commit en el repo (se actualiza sola en cada build tras un push)
    return execSync('git log -1 --format=%cI').toString().trim()
  } catch {
    return null
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __LAST_COMMIT_DATE__: JSON.stringify(getLastCommitDate()),
  },
})
