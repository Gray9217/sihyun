import { navCenter, primaryBtn } from '../../data/constants'

export default function Header({ goHome, loggedInUser, handleLogout, openAuthModal, handleNavClick }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-[72px] max-w-[1200px] items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-6">
        <button type="button" onClick={goHome} className="flex shrink-0 items-center gap-2.5 text-left">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-xs font-bold text-white">
            S
          </span>
          <span className="font-display text-xl text-[#171717]">썸앤쌈</span>
          {loggedInUser && (
            <span className="hidden truncate text-sm font-medium text-[#6b6570] sm:inline">· {loggedInUser}님</span>
          )}
        </button>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#4a4550] lg:flex">
          {navCenter.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => handleNavClick(label)}
              className="transition hover:text-[#171717]"
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {loggedInUser ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full px-3 py-2 text-sm font-semibold text-[#6b6570] hover:text-[#2a2a33]"
            >
              로그아웃
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold text-[#171717] transition hover:bg-neutral-50 sm:px-4 sm:text-sm"
              >
                로그인
              </button>
              <button type="button" onClick={() => openAuthModal('signup')} className={primaryBtn + ' py-2.5 text-xs sm:text-sm'}>
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}