export function getApiBase() {
    // VITE_API_URL이 없으면 https://sihyun.vercel.app을 강제로 사용합니다.
    const url = import.meta.env.VITE_API_URL || "https://sihyun.vercel.app";
    return url.replace(/\/$/, "");
}

export function getKakaoLoginUrl() {
    return `${getApiBase()}/auth/kakao`;
}

export function getKakaoLogoutUrl() {
    return `${getApiBase()}/auth/kakao/logout`;
}
