import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
    // 현재 환경(development, production 등)에 맞는 환경 변수를 로드합니다.
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react(), tailwindcss()],
        server: {
            proxy: {
                "/api": {
                    // Vercel 환경 변수(VITE_API_URL)가 있으면 그걸 쓰고, 없으면 로컬 사용
                    target: env.VITE_API_URL || "http://localhost:5000",
                    changeOrigin: true,
                    // 배포 환경에서 API 주소가 제대로 전달되도록 설정
                    secure: false,
                },
            },
        },
    };
});
