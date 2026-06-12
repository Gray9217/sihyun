export default function TestResultPage({ resultType, testTitle, testResultDetail, loveScore, goTests }) {
  if (!resultType) return null

  const scoreLabel =
    testTitle?.includes('이별') || testTitle?.includes('미련')
      ? '정리 지수'
      : testTitle?.includes('집착')
        ? '연애 안정 지수'
        : '썸 성공 확률'

  return (
    <main className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="overflow-hidden rounded-[2.5rem] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        <div className="bg-gradient-to-r from-[#171717] to-[#404040] px-8 py-10 text-center text-white">
          <div className="text-6xl">{resultType.icon}</div>
          <p className="mt-5 text-sm font-bold opacity-90">LOVE TEST RESULT</p>
          {testTitle && <p className="mt-2 text-xs opacity-80">{testTitle}</p>}
          <h1 className="mt-3 text-3xl font-black leading-snug">{resultType.title}</h1>
        </div>
        <div className="p-8">
          <div className="rounded-[2rem] bg-neutral-100 p-6 text-center">
            <p className="text-sm font-bold text-[#171717]">{scoreLabel}</p>
            <div className="mt-3 text-6xl font-black text-[#171717]">{loveScore}%</div>
            <div className="mt-5 h-4 overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full rounded-full bg-[#171717]" style={{ width: `${loveScore}%` }} />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#6b6570]">기본 분석</p>
              <p className="mt-3 text-base leading-relaxed text-[#5f5f66]">{resultType.desc}</p>
            </div>
            {testResultDetail && (
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-[#6b6570]">상세 분석</p>
                <p className="mt-3 text-base leading-relaxed text-[#4a4550]">{testResultDetail}</p>
              </div>
            )}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`[${testTitle || '썸앤쌈 테스트'}] ${resultType.title} / ${scoreLabel} ${loveScore}% 💕`)
                alert('결과가 복사됐어요!')
              }}
              className="flex-1 rounded-full border-2 border-[#171717] bg-white px-6 py-4 text-sm font-bold text-[#171717]"
            >
              결과 공유하기
            </button>
            <button type="button" onClick={goTests} className="flex-1 rounded-full bg-[#171717] px-6 py-4 text-sm font-bold text-white">
              다른 테스트 하기
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
