import { useState, useRef, useEffect } from 'react'
import { relationshipTabs, genderOptions, trendingTests, MAX_IMAGE_SIZE_MB } from '../data/constants'
import { converseWithAI, fetchConversationHistory } from '../api/converseApi'
import { getCurrentUserId } from '../api/communityApi.js'

const QUICK_REPLIES = [
  '이 사람 나한테 관심 있을까?',
  '다음에 뭐라고 답장할까?',
  '내 답장 예시 추천해줘',
  '지금 대화 분위기 어때?',
]

function compressImageToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        const maxDim = 1200
        if (width > height) {
          if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim }
        } else {
          if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim }
        }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1]
        resolve({ data: base64, mediaType: 'image/jpeg' })
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ChatAnalyzePage({ goHome, goBack }) {
  const [phase, setPhase] = useState('setup') // 'setup' | 'chat'
  const [relationship, setRelationship] = useState('썸')
  const [myGender, setMyGender] = useState('여성')
  const [otherGender, setOtherGender] = useState('남성')
  const [pickedTest, setPickedTest] = useState(trendingTests[0])

  const [messages, setMessages] = useState([]) // {role, content}
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [attachedImages, setAttachedImages] = useState([])
  const [conversationId, setConversationId] = useState(null)

  const [showHistory, setShowHistory] = useState(false)
  const [historyList, setHistoryList] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const attachInputRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isSending])

  useEffect(() => {
    return () => attachedImages.forEach((img) => URL.revokeObjectURL(img.preview))
  }, [attachedImages])

  const startChat = () => {
    setConversationId(null)
    setMessages([
      {
        role: 'assistant',
        content: `안녕하세요! ${relationship} 관계 상담을 도와드릴게요 😊\n지금 어떤 상황인지 편하게 얘기해 주세요. 카톡 캡처를 첨부해도 좋아요!`,
      },
    ])
    setPhase('chat')
  }

  const endChat = () => {
    setShowMenu(false)
    setMessages([])
    setConversationId(null)
    setAttachedImages([])
    setPhase('setup')
  }

  const openHistory = async () => {
    setShowHistory(true)
    setHistoryLoading(true)
    try {
      const list = await fetchConversationHistory(getCurrentUserId())
      setHistoryList(list)
    } catch {
      setHistoryList([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const loadConversation = (convo) => {
    const meta = convo.metadata || {}
    if (meta.relationship) setRelationship(meta.relationship)
    if (meta.myGender) setMyGender(meta.myGender)
    if (meta.otherGender) setOtherGender(meta.otherGender)
    if (meta.test) setPickedTest(meta.test)
    setConversationId(convo._id)
    setMessages((convo.messages || []).map((m) => ({ role: m.role, content: m.content })))
    setPhase('chat')
    setShowHistory(false)
  }

  const previewOf = (convo) => {
    const firstUser = (convo.messages || []).find((m) => m.role === 'user')
    const text = firstUser?.content || (convo.messages?.[0]?.content ?? '')
    return text.length > 40 ? `${text.slice(0, 40)}…` : text || '(내용 없음)'
  }

  const addAttachImages = (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const accepted = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        alert(`사진 한 장당 ${MAX_IMAGE_SIZE_MB}MB 이하만 가능해요.`)
        continue
      }
      accepted.push({ id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, file, preview: URL.createObjectURL(file), name: file.name })
    }
    if (accepted.length) setAttachedImages((prev) => [...prev, ...accepted])
  }

  const removeAttachImage = (id) => {
    setAttachedImages((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  const send = async (textArg) => {
    const content = (textArg ?? input).trim()
    if (!content || isSending) return

    const imagesToSend = attachedImages
    const userMsg = {
      role: 'user',
      content,
      images: imagesToSend.map((i) => i.preview),
    }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setAttachedImages([])
    setIsSending(true)

    try {
      let imageDataList = []
      if (imagesToSend.length > 0) {
        imageDataList = await Promise.all(imagesToSend.map((img) => compressImageToBase64(img.file)))
      }

      const payload = {
        messages: history.map((m) => ({ role: m.role, content: m.content })),
        myGender,
        otherGender,
        relationship,
        test: pickedTest,
        chatImages: imageDataList,
        userId: getCurrentUserId(),
        conversationId,
      }

      const res = await converseWithAI(payload)
      if (res.success) {
        if (res.conversationId) setConversationId(res.conversationId)
        setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.message || '응답을 받지 못했어요. 다시 시도해 주세요.' }])
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: err.message || '메시지 전송 중 오류가 발생했어요.' }])
    } finally {
      setIsSending(false)
    }
  }

  const historyDrawer = showHistory && (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowHistory(false)}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative h-full w-full max-w-[360px] overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="text-base font-bold text-[#171717]">이전 상담 대화</h2>
          <button type="button" onClick={() => setShowHistory(false)} className="text-xl text-[#9b95a3] hover:text-[#171717]" aria-label="닫기">×</button>
        </div>
        {historyLoading ? (
          <p className="p-6 text-center text-sm text-[#9b95a3]">불러오는 중...</p>
        ) : historyList.length === 0 ? (
          <p className="p-6 text-center text-sm text-[#9b95a3]">저장된 상담 대화가 없어요.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {historyList.map((convo) => (
              <li key={convo._id}>
                <button
                  type="button"
                  onClick={() => loadConversation(convo)}
                  className={`block w-full px-5 py-4 text-left transition hover:bg-neutral-50 ${convo._id === conversationId ? 'bg-pink-50/60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#f4709a]">{convo.metadata?.relationship || '상담'}</span>
                    <span className="text-xs text-[#b0aab6]">{new Date(convo.updatedAt || convo.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-[#4a4550]">{previewOf(convo)}</p>
                  <p className="mt-1 text-xs text-[#b0aab6]">메시지 {convo.messages?.length || 0}개</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  // ───────── 설정 단계 ─────────
  if (phase === 'setup') {
    return (
      <main className="mx-auto max-w-[560px] px-4 py-10 sm:px-6 sm:py-14">
        <button
          type="button"
          onClick={goBack || goHome}
          className="mb-6 text-sm font-semibold text-[#6b6570] hover:text-[#171717]"
        >
          ← 분석 방식 선택
        </button>

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fee500] text-2xl">💬</span>
          <div>
            <h1 className="font-display text-2xl">AI 상담 채팅</h1>
            <p className="text-sm text-[#6b6570]">대화를 시작하기 전에 기본 정보만 알려주세요.</p>
          </div>
        </div>

        <div className="mt-8 space-y-6 rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-8">
          <div>
            <p className="text-sm font-semibold text-[#2a2a33]">관계 단계</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {relationshipTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRelationship(tab)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    relationship === tab
                      ? 'border-[#171717] bg-[#171717] text-white'
                      : 'border-neutral-200 bg-white text-[#4a4550] hover:border-neutral-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-[#5f3f5d]">
              내 성별
              <select value={myGender} onChange={(e) => setMyGender(e.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[#2a2a33] outline-none focus:border-[#171717]">
                {genderOptions.map((g) => <option key={`me-${g}`} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-[#5f3f5d]">
              상대방 성별
              <select value={otherGender} onChange={(e) => setOtherGender(e.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[#2a2a33] outline-none focus:border-[#171717]">
                {genderOptions.map((g) => <option key={`other-${g}`} value={g}>{g}</option>)}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={startChat}
            className="w-full rounded-xl bg-[#fee500] px-6 py-3.5 text-sm font-bold text-[#3c1e1e] transition hover:bg-[#fdd835] active:scale-[0.99]"
          >
            상담 채팅 시작하기
          </button>
          <button
            type="button"
            onClick={openHistory}
            className="w-full text-center text-sm font-semibold text-[#6b6570] underline-offset-2 hover:underline"
          >
            또는 이전 상담 이어보기
          </button>
        </div>
        {historyDrawer}
      </main>
    )
  }

  // ───────── 채팅 단계 ─────────
  return (
    <main className="mx-auto max-w-[560px] px-0 sm:px-6 sm:py-6">
      <div className="flex h-[calc(100vh-72px)] flex-col overflow-hidden bg-[#b2c7d9] sm:h-[calc(100vh-140px)] sm:rounded-[1.5rem] sm:border sm:border-neutral-200 sm:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        {/* 채팅방 헤더 */}
        <div className="relative flex items-center gap-3 border-b border-black/5 bg-[#a3bace] px-4 py-3">
          <button type="button" onClick={goBack || goHome} className="text-lg text-[#3c4a57]" aria-label="뒤로">‹</button>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fee500] text-lg">💛</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#2a2a33]">AI 연애상담사</p>
            <p className="truncate text-xs text-[#5b6b78]">{relationship} · {myGender} → {otherGender}</p>
          </div>
          <button
            type="button"
            onClick={openHistory}
            className="shrink-0 rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#3c4a57] transition hover:bg-white"
          >
            이전 대화
          </button>
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-[#3c4a57] transition hover:bg-white/60"
            aria-label="메뉴"
          >
            ⋮
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-3 top-14 z-20 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white py-1 shadow-xl">
                <button type="button" onClick={endChat} className="block w-full px-4 py-2.5 text-left text-sm text-[#2a2a33] hover:bg-neutral-50">
                  🔄 새 상담 시작
                </button>
                <button type="button" onClick={() => { setShowMenu(false); (goBack || goHome)() }} className="block w-full px-4 py-2.5 text-left text-sm text-[#2a2a33] hover:bg-neutral-50">
                  ↩ 분석 방식 선택
                </button>
                <button type="button" onClick={() => { setShowMenu(false); goHome() }} className="block w-full px-4 py-2.5 text-left text-sm text-[#2a2a33] hover:bg-neutral-50">
                  🏠 홈으로
                </button>
              </div>
            </>
          )}
        </div>

        {/* 메시지 영역 */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5">
          {messages.map((m, idx) => (
            <MessageBubble key={idx} message={m} />
          ))}
          {isSending && (
            <div className="flex items-end gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fee500] text-sm">💛</span>
              <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-300 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-300 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-neutral-300" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 빠른 질문 칩 */}
        <div className="flex gap-2 overflow-x-auto border-t border-black/5 bg-[#acc1d4] px-3 py-2">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={isSending}
              className="shrink-0 rounded-full border border-white/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#3c4a57] transition hover:bg-white disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* 첨부 미리보기 */}
        {attachedImages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto bg-[#acc1d4] px-3 pb-2">
            {attachedImages.map((img) => (
              <div key={img.id} className="relative shrink-0">
                <img src={img.preview} alt={img.name} className="h-14 w-14 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removeAttachImage(img.id)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#171717] text-[10px] text-white"
                  aria-label="첨부 삭제"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 입력 바 */}
        <div className="flex items-end gap-2 border-t border-black/5 bg-[#f7f7f8] px-3 py-2.5">
          <input ref={attachInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addAttachImages(e.target.files); e.target.value = '' }} />
          <button
            type="button"
            onClick={() => attachInputRef.current?.click()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl text-[#6b6570] hover:bg-neutral-200"
            aria-label="사진 첨부"
          >
            ＋
          </button>
          <textarea
            value={input}
            onChange={(e) => { if (e.target.value.length <= 1000) setInput(e.target.value) }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            rows={1}
            placeholder="메시지를 입력하세요"
            className="max-h-28 min-h-[40px] flex-1 resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-[#2a2a33] outline-none focus:border-neutral-400"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={isSending || (!input.trim() && attachedImages.length === 0)}
            className="flex h-10 shrink-0 items-center rounded-2xl bg-[#fee500] px-4 text-sm font-bold text-[#3c1e1e] transition hover:bg-[#fdd835] disabled:opacity-40"
          >
            전송
          </button>
        </div>
      </div>
      {historyDrawer}
    </main>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'
  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1">
        {message.images?.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {message.images.map((src, i) => (
              <img key={i} src={src} alt="첨부" className="max-h-40 rounded-2xl rounded-tr-md object-cover" />
            ))}
          </div>
        )}
        {message.content && (
          <div className="max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-[#fee500] px-3.5 py-2.5 text-sm leading-relaxed text-[#2a2a33] shadow-sm">
            {message.content}
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="flex items-end gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fee500] text-sm">💛</span>
      <div className="max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-sm leading-relaxed text-[#2a2a33] shadow-sm">
        {message.content}
      </div>
    </div>
  )
}
