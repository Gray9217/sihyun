import { useRef, useState } from 'react'
import { converseWithAI } from '../api/converseApi'

const HELP_CARDS = [
  { id: 'breakup', emoji: '💔', sub: '😢', title: '차였어요', desc: '갑작스러운 이별, 이유가 궁금해요', flow: 'breakup' },
  { id: 'noreply', emoji: '💬', sub: '😢', title: '연락이 안 와요', desc: '상대의 마음이 궁금해요', flow: 'noreply' },
  { id: 'analysis', emoji: '😵‍💫', sub: '', title: '분석이 안 돼요', desc: '카톡 분석이 안 되거나 결과가 이상해요', type: '분석 오류' },
  { id: 'error', emoji: '❗', sub: '😠', title: '오류가 났어요', desc: '서비스 이용 중 문제가 발생했어요', type: '서비스 오류' },
]

const FAQS = [
  {
    q: '카톡 분석은 어떻게 하나요?',
    a: '상단 메뉴의 [카톡분석]에서 상황을 입력하거나 카카오톡 대화 캡처를 첨부하면 AI가 분석해드려요. 자세한 방법은 이용 가이드를 참고해주세요.',
  },
  {
    q: '분석 결과는 얼마나 정확한가요?',
    a: 'AI가 대화 패턴과 감정 흐름을 바탕으로 인사이트를 제공해요. 참고용 자료로 활용해주시는 것을 권장하며, 100% 정답을 보장하지는 않아요.',
  },
  {
    q: '분석 기록은 저장되나요?',
    a: '로그인 후 분석한 결과는 [MY분석]에 날짜별로 저장되어, 썸 지수 변화와 감정 비율을 그래프로 확인할 수 있어요.',
  },
  {
    q: '무료로 이용할 수 있나요?',
    a: '기본 분석과 AI 상담 채팅은 무료로 이용하실 수 있어요. 추후 프리미엄 기능이 추가될 수 있어요.',
  },
  {
    q: '회원 탈퇴는 어떻게 하나요?',
    a: '아래 1:1 문의하기로 탈퇴를 요청해주시면 빠르게 도와드릴게요. 탈퇴 시 분석 기록은 모두 삭제돼요.',
  },
]

const GUIDE_CARDS = [
  { emoji: '💬', title: '카톡 분석 가이드', desc: '카톡 분석 처음 이용하시나요? 분석 방법을 알려드려요!', action: 'analyze' },
  { emoji: '📖', title: '서비스 이용 안내', desc: '썸앤쌈의 다양한 기능과 이용 방법을 확인해보세요.' },
  { emoji: '💡', title: '분석 결과 이해하기', desc: '분석 결과를 어떻게 해석해야 할까요? 항목별 의미를 알려드려요.' },
  { emoji: '🔒', title: '개인정보 보호', desc: '개인정보는 어떻게 보호되고 있을까요? 안심하고 이용하세요.' },
]

const INQUIRY_TYPES = ['이별·감정 상담', '연락·관계 고민', '분석 오류', '서비스 오류', '계정·탈퇴', '기타']

export default function SupportPage({ goAnalyze, goTests }) {
  const [openFaq, setOpenFaq] = useState(0)
  const [inquiryType, setInquiryType] = useState('')
  const [inquiryTitle, setInquiryTitle] = useState('')
  const [inquiryBody, setInquiryBody] = useState('')
  const [activeFlow, setActiveFlow] = useState(null)
  const inquiryRef = useRef(null)

  const focusInquiry = (type) => {
    if (type) setInquiryType(type)
    inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleCardClick = (card) => {
    if (card.flow) setActiveFlow(card.flow)
    else focusInquiry(card.type)
  }

  const handleGuideClick = (action) => {
    if (action === 'analyze') goAnalyze?.()
    else focusInquiry()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inquiryType) return alert('문의 유형을 선택해주세요.')
    if (!inquiryTitle.trim()) return alert('제목을 입력해주세요.')
    if (!inquiryBody.trim()) return alert('문의 내용을 입력해주세요.')
    alert('문의가 접수되었어요! 빠르게 확인하고 답변드릴게요. 💌')
    setInquiryType('')
    setInquiryTitle('')
    setInquiryBody('')
  }

  return (
    <main className="bg-white">
      {/* 히어로 */}
      <section className="border-b border-neutral-100 bg-[#fafafa]">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:flex-row lg:justify-between">
          <div className="text-center lg:text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Emergency Support</p>
            <h1 className="mt-4 font-display text-4xl text-[#171717] sm:text-5xl">
              썸앤쌈 SOS <span aria-hidden>🚨</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-600">
              썸앤쌈이 여러분의 연애 응급상황을 도와드릴게요.
              <br />
              어떤 문제가 있으신가요?
            </p>
          </div>
          <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] border border-neutral-200 bg-white text-6xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:h-40 sm:w-40">
            🩹
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-4 pb-20 sm:px-6">
        {/* 도움 카드 */}
        <section className="pt-12">
          <h2 className="text-center font-display text-2xl text-[#171717] sm:text-3xl">어떤 도움이 필요하세요?</h2>
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#171717]" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HELP_CARDS.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card)}
                className="card-hover group flex flex-col items-center rounded-[1.5rem] border border-neutral-200 bg-white p-7 text-center shadow-[0_8px_28px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:border-neutral-400"
              >
                <span className="text-4xl">
                  {card.emoji}{card.sub && <span className="ml-0.5">{card.sub}</span>}
                </span>
                <h3 className="mt-5 text-lg font-bold text-[#171717]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6b6570]">{card.desc}</p>
                <span className="mt-5 text-[#171717] transition-all group-hover:translate-x-1">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* FAQ + 1:1 문의 */}
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* FAQ */}
          <div className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-[0_8px_28px_rgba(0,0,0,0.05)] sm:p-7">
            <h2 className="text-lg font-bold text-[#171717]">많이 찾는 질문 TOP 5</h2>
            <ul className="mt-5 space-y-3">
              {FAQS.map((faq, idx) => {
                const open = openFaq === idx
                return (
                  <li key={faq.q} className={`overflow-hidden rounded-2xl border transition ${open ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-100 bg-white'}`}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : idx)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                    >
                      <span className="text-sm font-semibold text-[#171717]">{faq.q}</span>
                      <span className={`shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
                    </button>
                    {open && (
                      <p className="px-4 pb-4 text-sm leading-relaxed text-[#6b6570]">{faq.a}</p>
                    )}
                  </li>
                )
              })}
            </ul>
            <button
              type="button"
              onClick={() => setOpenFaq(-1)}
              className="mx-auto mt-5 flex items-center gap-1 text-sm font-semibold text-[#171717] hover:underline"
            >
              모두 접기 →
            </button>
          </div>

          {/* 1:1 문의 */}
          <div ref={inquiryRef} className="rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-[0_8px_28px_rgba(0,0,0,0.05)] sm:p-7">
            <h2 className="text-lg font-bold text-[#171717]">1:1 문의하기</h2>
            <p className="mt-1 text-xs text-[#9b95a3]">궁금한 점이 해결되지 않았다면 1:1 문의를 남겨주세요.</p>
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-[#171717]">
                문의 유형
                <select
                  value={inquiryType}
                  onChange={(e) => setInquiryType(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#171717] outline-none focus:border-[#171717]"
                >
                  <option value="">선택해주세요</option>
                  {INQUIRY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold text-[#171717]">
                제목
                <input
                  value={inquiryTitle}
                  onChange={(e) => setInquiryTitle(e.target.value)}
                  placeholder="제목을 입력해주세요"
                  className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#171717] placeholder:text-[#b8b3bc] outline-none focus:border-[#171717]"
                />
              </label>
              <label className="block text-sm font-semibold text-[#171717]">
                내용
                <textarea
                  value={inquiryBody}
                  onChange={(e) => setInquiryBody(e.target.value)}
                  rows={5}
                  placeholder="문의 내용을 자세히 입력해주세요"
                  className="mt-2 w-full resize-y rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#171717] placeholder:text-[#b8b3bc] outline-none focus:border-[#171717]"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#171717] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#404040] active:scale-[0.99]"
              >
                문의 보내기 ✈
              </button>
            </form>
          </div>
        </section>

        {/* 가이드 */}
        <section className="mt-14">
          <h2 className="text-center font-display text-2xl text-[#171717] sm:text-3xl">썸앤쌈 가이드</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GUIDE_CARDS.map((card) => (
              <button
                key={card.title}
                type="button"
                onClick={() => handleGuideClick(card.action)}
                className="card-hover group flex flex-col rounded-[1.5rem] border border-neutral-200 bg-white p-6 text-left shadow-[0_8px_28px_rgba(0,0,0,0.05)] transition hover:-translate-y-1 hover:border-neutral-400"
              >
                <span className="text-3xl">{card.emoji}</span>
                <h3 className="mt-4 text-base font-bold text-[#171717]">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#6b6570]">{card.desc}</p>
                <span className="mt-4 text-[#171717] transition-all group-hover:translate-x-1">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* 하단 배너 */}
        <section className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[1.5rem] bg-[#f5f5f5] px-6 py-7 sm:flex-row sm:px-8">
          <div className="text-center sm:text-left">
            <p className="text-base font-bold text-[#171717]">그래도 해결이 안 된다면?</p>
            <p className="mt-1 text-sm text-[#6b6570]">썸앤쌈 팀이 직접 도와드릴게요! 언제든지 편하게 연락주세요.</p>
          </div>
          <a
            href="mailto:help@someandssam.com"
            className="shrink-0 rounded-2xl bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#404040]"
          >
            이메일 문의하기 ✉
          </a>
        </section>
      </div>

      {/* 진단 플로우 모달 */}
      {activeFlow && (
        <FlowModal onClose={() => setActiveFlow(null)}>
          {activeFlow === 'breakup' && <BreakupFlow goTests={goTests} onClose={() => setActiveFlow(null)} />}
          {activeFlow === 'noreply' && <NoReplyFlow onClose={() => setActiveFlow(null)} />}
        </FlowModal>
      )}
    </main>
  )
}

function FlowModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-[460px] overflow-y-auto rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-xl text-neutral-400 transition hover:text-[#171717]"
          aria-label="닫기"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

function StepBadge({ step, total }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-[#171717]' : i < step ? 'w-3 bg-[#171717]' : 'w-3 bg-neutral-200'}`} />
      ))}
    </div>
  )
}

function OptionList({ options, value, onSelect }) {
  return (
    <div className="mt-5 space-y-2.5">
      {options.map((opt) => {
        const selected = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition ${
              selected ? 'border-[#171717] bg-[#171717] text-white' : 'border-neutral-200 bg-white text-[#2a2a33] hover:border-neutral-400'
            }`}
          >
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected ? 'border-white' : 'border-neutral-300'}`}>
              {selected && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ───────── 차였어요 플로우 ─────────
const BREAKUP_WHEN = ['1주 이내', '1개월 이내', '3개월 이내', '6개월 이상']
const BREAKUP_WHO = ['상대방', '나', '서로 합의']
const RECOMMEND_TESTS = ['재회 가능성 테스트', '상대방 미련 분석', '연애 회복 유형 테스트']

function computeRecovery(when, who) {
  const base = { '1주 이내': 25, '1개월 이내': 50, '3개월 이내': 70, '6개월 이상': 88 }[when] ?? 50
  const adj = { 나: 10, '서로 합의': 5, 상대방: -5 }[who] ?? 0
  return Math.max(10, Math.min(95, base + adj))
}

function recoveryMessage(pct) {
  if (pct < 40) {
    return '아직 상대방을 많이 생각하는 시기예요.\n억지로 연락하기보다 충분히 시간을 두는 것이 좋아 보여요.'
  }
  if (pct < 70) {
    return '조금씩 마음을 추스르고 있는 단계예요.\n나를 돌보는 시간에 집중하면 회복이 더 빨라질 거예요.'
  }
  return '많이 회복된 상태예요.\n이제는 새로운 관계나 일상에 다시 마음을 열어도 좋아 보여요.'
}

function BreakupFlow({ goTests, onClose }) {
  const [step, setStep] = useState(0)
  const [when, setWhen] = useState('')
  const [who, setWho] = useState('')

  const recovery = computeRecovery(when, who)

  return (
    <div>
      <div className="flex items-center justify-between pr-8">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">STEP {step + 1}</p>
        <StepBadge step={step} total={4} />
      </div>

      {step === 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#171717]">💔 언제 헤어졌나요?</h3>
          <OptionList options={BREAKUP_WHEN} value={when} onSelect={(v) => { setWhen(v); setStep(1) }} />
        </div>
      )}

      {step === 1 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#171717]">누가 먼저 헤어지자고 했나요?</h3>
          <OptionList options={BREAKUP_WHO} value={who} onSelect={(v) => { setWho(v); setStep(2) }} />
          <button type="button" onClick={() => setStep(0)} className="mt-5 text-sm font-semibold text-[#9b95a3] hover:text-[#171717]">← 이전</button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#171717]">AI 분석</h3>
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center">
            <p className="text-sm font-semibold text-[#6b6570]">💔 현재 회복 단계</p>
            <p className="mt-2 text-5xl font-black text-[#171717]">{recovery}<span className="text-2xl">%</span></p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full rounded-full bg-[#171717] transition-all" style={{ width: `${recovery}%` }} />
            </div>
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-[#4a4550]">{recoveryMessage(recovery)}</p>
          </div>
          <button type="button" onClick={() => setStep(3)} className="mt-5 w-full rounded-2xl bg-[#171717] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#404040]">
            추천 테스트 보기 →
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#171717]">추천 테스트</h3>
          <p className="mt-1 text-sm text-[#9b95a3]">지금 마음 상태에 도움이 될 만한 테스트예요.</p>
          <div className="mt-5 space-y-2.5">
            {RECOMMEND_TESTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { onClose?.(); goTests?.() }}
                className="card-hover flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 text-left text-sm font-semibold text-[#171717] transition hover:border-neutral-400"
              >
                {t}
                <span className="text-neutral-400">→</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ───────── 연락이 안 와요 플로우 ─────────
const NOREPLY_DURATION = ['하루', '3일', '1주', '2주 이상']
const NOREPLY_RELATION = ['썸', '연애중', '짝사랑', '헤어진 상태']

function NoReplyFlow({ onClose }) {
  const [step, setStep] = useState(0)
  const [duration, setDuration] = useState('')
  const [relation, setRelation] = useState('')
  const [situation, setSituation] = useState('')
  const [loading, setLoading] = useState(false)
  const [opinion, setOpinion] = useState('')

  const requestOpinion = async () => {
    setStep(3)
    setLoading(true)
    setOpinion('')
    const prompt = `${relation} 관계인데 ${duration} 동안 상대에게서 연락이 없어요.\n최근 상황: ${situation || '(추가 설명 없음)'}\n\n상대방의 마음이 어떤 상태일지, 그리고 제가 지금 어떻게 행동하면 좋을지 따뜻하지만 솔직하게 조언해 주세요. 3~4문장으로 부탁해요.`
    try {
      const res = await converseWithAI({
        messages: [{ role: 'user', content: prompt }],
        relationship: relation,
      })
      if (res.success) setOpinion(res.reply)
      else setOpinion('지금은 분석이 어려워요. 잠시 후 다시 시도해 주세요.')
    } catch {
      setOpinion('상대도 나름의 이유로 답을 미루고 있을 수 있어요. 너무 조급해하지 말고, 하루 정도 여유를 둔 뒤 가볍게 안부를 건네보는 것도 방법이에요. 연락 여부보다 내 마음을 먼저 챙겨주세요. 💛')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between pr-8">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">{step < 3 ? `STEP ${step + 1}` : '결과'}</p>
        <StepBadge step={step} total={4} />
      </div>

      {step === 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#171717]">📱 얼마나 연락이 없나요?</h3>
          <OptionList options={NOREPLY_DURATION} value={duration} onSelect={(v) => { setDuration(v); setStep(1) }} />
        </div>
      )}

      {step === 1 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#171717]">현재 관계</h3>
          <OptionList options={NOREPLY_RELATION} value={relation} onSelect={(v) => { setRelation(v); setStep(2) }} />
          <button type="button" onClick={() => setStep(0)} className="mt-5 text-sm font-semibold text-[#9b95a3] hover:text-[#171717]">← 이전</button>
        </div>
      )}

      {step === 2 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#171717]">최근 상황을 알려주세요</h3>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={5}
            placeholder="마지막 대화 분위기, 내가 보낸 메시지, 고민되는 점 등을 적어주세요."
            className="mt-4 w-full resize-y rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#171717] placeholder:text-[#b8b3bc] outline-none focus:border-[#171717]"
          />
          <button
            type="button"
            onClick={requestOpinion}
            className="mt-5 w-full rounded-2xl bg-[#171717] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#404040]"
          >
            AI 의견 받기 →
          </button>
          <button type="button" onClick={() => setStep(1)} className="mt-3 block text-sm font-semibold text-[#9b95a3] hover:text-[#171717]">← 이전</button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#171717]">❤️ AI 의견</h3>
          <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-[#6b6570]">
                <span className="inline-block animate-spin">⏳</span> AI가 상황을 살펴보는 중이에요...
              </div>
            ) : (
              <p className="whitespace-pre-line text-sm leading-relaxed text-[#2a2a33]">{opinion}</p>
            )}
          </div>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={() => { setStep(2) }} className="flex-1 rounded-2xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-[#171717] transition hover:bg-neutral-50">
              다시 작성
            </button>
            <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#404040]">
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
