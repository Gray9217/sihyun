// src/api/authApi.js

export function getApiBase() {
  // 1. 배포용 서버 주소를 여기에 직접 고정합니다.
  const PRODUCTION_URL = "https://sihyun.vercel.app";

  // 2. 환경변수가 로드되지 않았을 경우를 대비한 안전 장치
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
                  ? import.meta.env.VITE_API_URL 
                  : PRODUCTION_URL;
  
  return envUrl.replace(/\/$/, "");
}

export function getKakaoLoginUrl() {
  return `${getApiBase()}/auth/kakao`;
}

export function getKakaoLogoutUrl() {
  return `${getApiBase()}/auth/kakao/logout`;
}