export default function Footer() {
    return (
      <footer className="border-t border-neutral-200 bg-white py-10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 text-xs text-[#6b6570] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-display text-base text-[#171717]">썸앤쌈</p>
            <p className="mt-1">© {new Date().getFullYear()} Some &amp; Ssam. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <button type="button" className="hover:text-[#171717]">회사소개</button>
            <button type="button" className="hover:text-[#171717]">이용약관</button>
            <button type="button" className="hover:text-[#171717]">개인정보처리방침</button>
            <button type="button" className="hover:text-[#171717]">문의하기</button>
          </div>
          <div className="flex gap-4 text-lg opacity-70">
            <span aria-hidden>📷</span>
            <span aria-hidden>𝕏</span>
            <span aria-hidden>▶</span>
          </div>
        </div>
      </footer>
    )
  }