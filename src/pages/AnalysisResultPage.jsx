import { primaryBtn, outlineBtn } from '../data/constants'

export default function AnalysisResultPage({ analysisResult, goHome, goAnalyze }) {
  if (!analysisResult) {
    return (
      <main className="mx-auto max-w-[720px] px-4 py-12 text-center sm:px-6">
        <p className="text-[#6b6570]">분석 결과를 불러올 수 없습니다.</p>
        <button type="button" onClick={goHome} className={`${primaryBtn} mt-6 inline-block`}>
          홈으로 돌아가기
        </button>
      </main>
    )
  }

  const { analysis, metadata, storyText } = analysisResult

  return (
    <main className="mx-auto max-w-[720px] px-4 py-8 sm:px-6 sm:py-12">
      <button
        type="button"
        onClick={goHome}
        className="mb-6 text-sm font-semibold text-[#6b6570] hover:text-[#171717]"
      >
        ← 홈으로
      </button>

      <div className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-8">
        {/* 헤더 */}
        <div className="border-b border-neutral-200 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💕</span>
            <h1 className="font-display text-2xl sm:text-3xl text-[#171717]">
              {metadata.myGender}의 {metadata.relationship} 관계 분석
            </h1>
          </div>
          <p className="mt-3 text-sm text-[#6b6570]">
            상대방 성별: <span className="font-semibold text-[#171717]">{metadata.otherGender}</span> | 
            분석 유형: <span className="font-semibold text-[#171717]">{metadata.storyType}</span> |
            참고 테스트: <span className="font-semibold text-[#171717]">{metadata.test}</span>
          </p>
        </div>

        {/* 분석 결과 */}
        <div className="mt-8 space-y-8">
          <div className="prose prose-sm max-w-none">
            {analysis.split('\n').map((line, idx) => {
              // 제목 (##으로 시작)
              if (line.startsWith('## ')) {
                return (
                  <h2
                    key={idx}
                    className="mt-6 mb-3 text-lg font-bold text-[#171717] flex items-center gap-2"
                  >
                    {line.replace('## ', '')}
                  </h2>
                )
              }
              // 빈 줄 무시
              if (!line.trim()) {
                return null
              }
              // 일반 텍스트
              return (
                <p key={idx} className="text-sm leading-relaxed text-[#4a4550] mb-2">
                  {line}
                </p>
              )
            })}
          </div>
        </div>

        {/* 입력한 내용 보기 */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b6570]">입력한 내용</p>
          <p className="mt-3 text-sm text-[#4a4550] whitespace-pre-wrap max-h-32 overflow-y-auto">
            {storyText}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={goAnalyze} className={`${primaryBtn} flex-1`}>
            다시 분석하기
          </button>
          <button type="button" onClick={goHome} className={`${outlineBtn} flex-1`}>
            홈으로 돌아가기
          </button>
        </div>

        {/* 조언 섹션 */}
        <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 mb-2">💡 TIP</p>
          <p className="text-sm text-blue-800">
            더 정확한 분석을 원하신다면 구체적인 대화 내용이나 상황을 자세히 작성해 주세요. 
            AI가 더욱 정밀한 분석을 제공해드릴 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  )
}
