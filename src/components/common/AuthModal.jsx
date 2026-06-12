import KakaoLoginButton from './KakaoLoginButton'

export default function AuthModal({
    authMode,
    setAuthMode,
    setIsAuthModalOpen,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    handleLogin,
    signupUsername,
    setSignupUsername,
    signupEmail,
    setSignupEmail,
    signupPassword,
    setSignupPassword,
    signupPasswordConfirm,
    setSignupPasswordConfirm,
    handleSignup,
    primaryBtn,
    authNotice,
  }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-2xl shadow-neutral-200/40 sm:p-8">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute right-4 top-4 text-sm font-medium text-[#6b6570] hover:text-[#2a2a33]"
          >
            닫기 ✕
          </button>
  
          {authNotice && (
            <p className="mb-4 rounded-xl bg-neutral-100 px-3 py-2.5 text-center text-xs leading-relaxed text-[#4a4550]">
              {authNotice}
            </p>
          )}
  
          <div className="inline-flex w-full rounded-2xl border border-neutral-200 bg-neutral-100/50 p-1">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`w-1/2 rounded-xl py-2.5 text-sm font-bold transition ${
                authMode === 'login' ? 'bg-[#171717] text-white shadow-md' : 'text-[#6b6570]'
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`w-1/2 rounded-xl py-2.5 text-sm font-bold transition ${
                authMode === 'signup' ? 'bg-[#171717] text-white shadow-md' : 'text-[#6b6570]'
              }`}
            >
              회원가입
            </button>
          </div>
  
          {authMode === 'login' ? (
            <div className="mt-6 space-y-4">
              <p className="text-lg font-black">로그인</p>
              <p className="text-xs text-[#6b6570]">썸앤쌈에 오신 것을 환영해요!</p>
              <input
                type="email"
                placeholder="이메일 주소"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-[#b8b3bc] focus:border-[#171717]"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-[#b8b3bc] focus:border-[#171717]"
              />
              <button type="button" onClick={handleLogin} className={`${primaryBtn} w-full mt-2`}>
                로그인하기
              </button>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <p className="relative mx-auto w-fit bg-white px-3 text-xs text-[#6b6570]">또는</p>
              </div>
              <KakaoLoginButton />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-lg font-black">회원가입</p>
              <p className="text-xs text-[#6b6570]">썸앤쌈에서 새로운 인연을 찾아보세요!</p>
              <input
                type="text"
                placeholder="닉네임"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-[#b8b3bc] focus:border-[#171717]"
              />
              <input
                type="email"
                placeholder="이메일 주소"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-[#b8b3bc] focus:border-[#171717]"
              />
              <input
                type="password"
                placeholder="비밀번호 (8자 이상)"
                minLength={8}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-[#b8b3bc] focus:border-[#171717]"
              />
              <input
                type="password"
                placeholder="비밀번호 확인"
                value={signupPasswordConfirm}
                onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-[#b8b3bc] focus:border-[#171717]"
              />
              <button type="button" onClick={handleSignup} className={`${primaryBtn} w-full mt-2`}>
                회원가입하기
              </button>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <p className="relative mx-auto w-fit bg-white px-3 text-xs text-[#6b6570]">또는</p>
              </div>
              <KakaoLoginButton />
            </div>
          )}
        </div>
      </div>
    )
  }