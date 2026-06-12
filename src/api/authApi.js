export function getApiBase() {
  return (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')
}

export function getKakaoLoginUrl() {
  return `${getApiBase()}/auth/kakao`
}

export function getKakaoLogoutUrl() {
  return `${getApiBase()}/auth/kakao/logout`
}
