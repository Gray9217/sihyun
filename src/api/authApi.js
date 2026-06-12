// authApi.js 파일을 아래 코드로 완전히 교체하세요.
export function getApiBase() {
  // 1. 배포된 Vercel 환경인지 확인
  // 2. 환경 변수가 없으면 무조건 'https://sihyun.vercel.app'을 사용하도록 강제
  const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) 
              ? import.meta.env.VITE_API_URL 
              : "https://sihyun.vercel.app";
  
  return url.replace(/\/$/, "");
}

export function getKakaoLoginUrl() {
  return `${getApiBase()}/auth/kakao`;
}

export function getKakaoLogoutUrl() {
  return `${getApiBase()}/auth/kakao/logout`;
}