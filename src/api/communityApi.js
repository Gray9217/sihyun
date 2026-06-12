import axios from "axios";
import { getApiBase } from "./authApi.js";

const API_BASE = getApiBase();

export function getAuthToken() {
    return localStorage.getItem("ssam_auth_token") || "";
}

export function setAuthSession({ username, token, userId, role, provider }) {
    localStorage.setItem("username", username);
    localStorage.setItem("ssam_auth_token", token);
    if (userId) localStorage.setItem("ssam_user_id", userId);
    if (role) localStorage.setItem("ssam_user_role", role);
    if (provider) localStorage.setItem("ssam_auth_provider", provider);
}

export function clearAuthSession() {
    localStorage.removeItem("username");
    localStorage.removeItem("ssam_auth_token");
    localStorage.removeItem("ssam_user_id");
    localStorage.removeItem("ssam_user_role");
    localStorage.removeItem("ssam_auth_provider");
}

export function getAuthProvider() {
    return localStorage.getItem("ssam_auth_provider") || "local";
}

export function getUserId() {
    return localStorage.getItem("ssam_user_id") || "";
}

/** localStorage 또는 JWT payload에서 사용자 ID */
export function getCurrentUserId() {
    const stored = getUserId();
    if (stored) return stored;

    const token = getAuthToken();
    if (!token) return "";

    try {
        const payload = token.split(".")[1];
        const json = JSON.parse(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
        const id = json.userId || "";
        if (id) localStorage.setItem("ssam_user_id", id);
        if (json.role) localStorage.setItem("ssam_user_role", json.role);
        return id;
    } catch {
        return "";
    }
}

export function getCurrentUserRole() {
    const stored = localStorage.getItem("ssam_user_role");
    if (stored) return stored;

    const token = getAuthToken();
    if (!token) return "user";

    try {
        const payload = token.split(".")[1];
        const json = JSON.parse(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        );
        const role = json.role || "user";
        localStorage.setItem("ssam_user_role", role);
        return role;
    } catch {
        return "user";
    }
}

export function isAdmin() {
    return getCurrentUserRole() === "admin";
}

function authHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchCommunityPosts() {
    const res = await axios.get(`${API_BASE}/api/community/posts`, {
        headers: authHeaders(),
    });
    return res.data.posts;
}

export async function fetchCommunityPost(postId) {
    const res = await axios.get(`${API_BASE}/api/community/posts/${postId}`, {
        headers: authHeaders(),
    });
    return res.data.post;
}

export async function createCommunityPost(payload) {
    const res = await axios.post(`${API_BASE}/api/community/posts`, payload, {
        headers: authHeaders(),
    });
    return res.data.post;
}

export async function updateCommunityPost(postId, payload) {
    const res = await axios.put(
        `${API_BASE}/api/community/posts/${postId}`,
        payload,
        {
            headers: authHeaders(),
        }
    );
    return res.data.post;
}

export async function deleteCommunityPost(postId) {
    const res = await axios.delete(
        `${API_BASE}/api/community/posts/${postId}`,
        {
            headers: authHeaders(),
        }
    );
    return res.data;
}

export async function togglePostLike(postId) {
    const res = await axios.post(
        `${API_BASE}/api/community/posts/${postId}/like`,
        null,
        {
            headers: authHeaders(),
        }
    );
    return res.data;
}

export async function fetchPostComments(postId) {
    const res = await axios.get(
        `${API_BASE}/api/community/posts/${postId}/comments`
    );
    return res.data.comments;
}

export async function createPostComment(postId, payload) {
    const res = await axios.post(
        `${API_BASE}/api/community/posts/${postId}/comments`,
        payload,
        {
            headers: authHeaders(),
        }
    );
    return res.data;
}

export async function fetchOpinions() {
    const res = await axios.get(`${API_BASE}/api/community/opinions`);
    return res.data.opinions;
}

export async function createOpinion(payload) {
    const res = await axios.post(
        `${API_BASE}/api/community/opinions`,
        payload,
        {
            headers: authHeaders(),
        }
    );
    return res.data.opinion;
}
