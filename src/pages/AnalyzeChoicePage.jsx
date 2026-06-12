export default function AnalyzeChoicePage({ goHome, goAnalyzeReport, goAnalyzeChat }) {
  return (
    <main className="mx-auto max-w-[860px] px-4 py-10 sm:px-6 sm:py-14">
      <button
        type="button"
        onClick={goHome}
        className="mb-6 text-sm font-semibold text-[#6b6570] hover:text-[#171717]"
      >
        ← 홈으로
      </button>

      <h1 className="font-display text-2xl sm:text-3xl">카톡 분석</h1>
      <p className="mt-2 text-sm text-[#6b6570]">
        원하는 방식을 골라주세요. 두 방식은 완전히 다르게 동작해요.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {/* 분석 리포트 */}
        <button
          type="button"
          onClick={goAnalyzeReport}
          className="group flex flex-col rounded-[1.75rem] border border-neutral-200 bg-white p-7 text-left shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:border-[#171717]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171717] text-2xl">📋</span>
          <h2 className="mt-5 text-lg font-bold text-[#171717]">분석 리포트</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6b6570]">
            상황과 카톡 사진을 한 번에 입력하면, AI가 감정·관심도·패턴을
            정리한 <span className="font-semibold text-[#171717]">리포트 한 장</span>을 만들어줘요.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-[#8a8590]">
            <li>· 한 번에 끝나는 종합 분석</li>
            <li>· 썸 지수·감정 비율 자동 계산</li>
            <li>· MY분석에 자동 저장</li>
          </ul>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#171717] group-hover:gap-2 transition-all">
            리포트 받기 →
          </span>
        </button>

        {/* AI 상담 채팅 */}
        <button
          type="button"
          onClick={goAnalyzeChat}
          className="group flex flex-col rounded-[1.75rem] border border-[#f4e06a] bg-[#fffdf2] p-7 text-left shadow-[0_12px_40px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:border-[#fee500]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fee500] text-2xl">💬</span>
          <h2 className="mt-5 text-lg font-bold text-[#171717]">AI 상담 채팅</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6b6570]">
            카톡하듯 <span className="font-semibold text-[#171717]">AI와 실시간으로 대화</span>하며
            상담받아요. 궁금한 걸 계속 물어보고 답장 예시도 받아볼 수 있어요.
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-[#8a8590]">
            <li>· 메신저 형태로 자유롭게 대화</li>
            <li>· 사진 첨부하며 이어서 상담</li>
            <li>· 대화 내용 저장 후 이어보기</li>
          </ul>
          <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#171717] group-hover:gap-2 transition-all">
            채팅 시작하기 →
          </span>
        </button>
      </div>
    </main>
  )
}
