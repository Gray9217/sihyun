import axios from "axios";
import { getCurrentUserId } from "./communityApi.js";
import { getApiBase } from "./authApi.js"; // authApi에서 함수 가져오기

// 환경 변수 직접 참조 대신 getApiBase() 함수 사용
const API_URL = getApiBase(); 

export const analyzeRelationship = async (analysisData) => {
    try {
        const payload = { ...analysisData, userId: getCurrentUserId() };
        const response = await axios.post(`${API_URL}/api/analyze`, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 60000,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchAnalysisHistory = async (userId) => {
    const id = userId || getCurrentUserId();
    if (!id) return [];
    const response = await axios.get(`${API_URL}/api/analysis/history/${id}`);
    return response.data.records || [];
};

export const toggleAnalysisFavorite = async (id) => {
    const response = await axios.patch(
        `${API_URL}/api/analysis/${id}/favorite`
    );
    return response.data;
};

export const deleteAnalysisRecord = async (id) => {
    const response = await axios.delete(`${API_URL}/api/analysis/${id}`);
    return response.data;
};