import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { isPortraitReviewBuild, portraitReviewArtifacts } from './scripts/profile-portrait-review-build.mjs';

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:3001";

export default defineConfig(({ mode }) => {
  const portraitReview = isPortraitReviewBuild(mode);
  return {
    define: { 'import.meta.env.PROFILE_PORTRAIT_REVIEW': JSON.stringify(portraitReview) },
    plugins: [react(), tailwindcss(), portraitReviewArtifacts(portraitReview)],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("@tanstack")) return "query";
            if (id.includes("react-icons")) return "icons";
            if (id.includes("react")) return "react-vendor";
          },
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
