// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    // server.proxy 설정을 통째로 삭제하여 배포 시 혼란을 방지합니다.
});