import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,

    proxy: {
      "/api": {
        target: "http://localhost:3010",
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: [
      "quiz-app-alb-1431337974.eu-central-1.elb.amazonaws.com",
    ],
  },
});