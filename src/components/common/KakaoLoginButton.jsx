import { getKakaoLoginUrl } from '../../api/authApi.js'

export default function KakaoLoginButton({ className = '' }) {
  const handleKakaoLogin = () => {
    window.location.href = getKakaoLoginUrl()
  }

  return (
    <button
      type="button"
      onClick={handleKakaoLogin}
      className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FEE500] px-4 py-3 text-sm font-bold text-[#191919] transition hover:bg-[#f5dc00] active:scale-[0.99] ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 1.5C4.86 1.5 1.5 4.177 1.5 7.5c0 2.115 1.395 3.975 3.495 5.025-.15.555-.54 2.01-.615 2.325 0 0-.015.12.075.165.09.045.195.015.255-.03 1.05-.705 2.475-1.845 2.865-2.145 1.05.15 2.145.225 3.225.225 4.14 0 7.5-2.677 7.5-6 0-3.323-3.36-6-7.5-6z"
          fill="#191919"
        />
      </svg>
      카카오로 시작하기
    </button>
  )
}
