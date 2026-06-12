export default function TestDetailPage({ goTests, selectedTest, currentQuestion, currentQuestions, handleAnswerClick }) {
    if (!selectedTest || !currentQuestions) return null;
  
    return (
      <main className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-14">
        <button type="button" onClick={goTests} className="mb-6 text-sm font-semibold text-[#6b6570] hover:text-[#171717]">← 테스트 목록으로</button>
        <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100 text-4xl">{selectedTest.icon}</div>
            <div>
              <p className="text-sm font-bold text-[#171717]">LOVE TEST</p>
              <h1 className="mt-1 text-2xl font-black">{selectedTest.title}</h1>
            </div>
          </div>
  
          <div className="mb-6 mt-8">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>질문 {currentQuestion + 1} / {currentQuestions.length}</span>
              <span className="text-[#171717]">{Math.round(((currentQuestion + 1) / currentQuestions.length) * 100)}%</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full rounded-full bg-[#171717] transition-all duration-300" style={{ width: `${((currentQuestion + 1) / currentQuestions.length) * 100}%` }} />
            </div>
          </div>
  
          <div className="mt-10">
            <p className="text-sm font-bold text-[#171717]">Q{currentQuestion + 1}.</p>
            <h2 className="mt-2 text-2xl font-black leading-snug">{currentQuestions[currentQuestion].question}</h2>
            <div className="mt-8 space-y-3">
              {currentQuestions[currentQuestion].options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleAnswerClick(option)}
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-left text-sm font-semibold transition hover:border-[#171717] hover:bg-neutral-100"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }