// 환경 변수가 아예 안 읽힐 때를 대비한 안전 장치 추가
const getApiUrl = () => {
  // 1. 빌드 타임 환경 변수
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // 2. 환경 변수가 없으면 무조건 실제 서버 주소 반환
  return "https://sihyun.vercel.app"; 
};

const API_URL = getApiUrl();
// 이제 axios 호출 시 무조건 API_URL을 사용하세요