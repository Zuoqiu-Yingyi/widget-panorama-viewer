import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    plugins: [
        tailwindcss(),
        svelte(),
    ],
    resolve: {
        tsconfigPaths: true,
    },
    build: {
        chunkSizeWarningLimit: 650,
        outDir: "dist",
        rollupOptions: {
            output: {
                assetFileNames: "assets/[name]-[hash][extname]",
                entryFileNames: "assets/[name]-[hash].js",
            },
        },
    },
});
