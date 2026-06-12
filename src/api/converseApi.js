import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

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
    const response = await axios.get(
        `${API_URL}/api/converse/history/${userId}`
    );
    return response.data.convos || [];
};
