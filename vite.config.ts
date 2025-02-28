import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/js/JsonRuleCompiler.ts',
      name: 'event-ruler',
      formats: ['es'],
    },
  },
  plugins: [
    checker({ typescript: true })
  ]
}); 