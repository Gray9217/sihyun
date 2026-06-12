import axios from "axios";
import { getApiBase } from "./authApi.js"; // 수정: getApiBase 사용

const API_URL = getApiBase(); // 수정: 환경 변수 직접 참조 대신 함수 사용

export const converseWithAI = async (payload) => {
    try {
        const response = await axios.post(`${API_URL}/api/converse`, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 60000,
        });
        return response.data;
    } catch (error) {
        console.error("converse API error", error);
        throw error;
    }
};

export const fetchConversationHistory = async (userId) => {
    if (!userId) return [];
    const response = await axios.get(`${API_URL}/api/converse/history/${userId}`);
    return response.data.convos || [];
};