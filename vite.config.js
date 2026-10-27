import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { isPortraitReviewBuild, portraitReviewArtifacts } from './scripts/profile-portrait-review-build.mjs';
import { isJobPilotDesignReviewBuild, jobPilotDesignArtifacts } from './scripts/jobpilot-design-review-build.mjs';

import { isFeaturedDesignReviewBuild, featuredDesignArtifacts } from './scripts/featured-design-review-build.mjs';

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:3001";

export default defineConfig(({ mode }) => {
  const portraitReview = isPortraitReviewBuild(mode);
  const jobPilotReview = isJobPilotDesignReviewBuild(mode);
  const featuredReview = isFeaturedDesignReviewBuild(mode);
  return {
    define: { 'import.meta.env.FEATURED_DESIGN_REVIEW': JSON.stringify(featuredReview), 'import.meta.env.PROFILE_PORTRAIT_REVIEW': JSON.stringify(portraitReview), 'import.meta.env.JOBPILOT_DESIGN_REVIEW': JSON.stringify(jobPilotReview) },
    plugins: [featuredDesignArtifacts(featuredReview), react(), tailwindcss(), portraitReviewArtifacts(portraitReview), jobPilotDesignArtifacts(jobPilotReview)],
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
