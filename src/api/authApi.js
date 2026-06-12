export function getApiBase() {
  // 1. 환경 변수가 있으면 사용하고, 없으면 아까 확인한 주소를 기본값으로 사용
  const url = (import.meta.env && import.meta.env.VITE_API_URL) 
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