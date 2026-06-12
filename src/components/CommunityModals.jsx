import { useEffect, useState } from 'react'

export function CommunityWriteModal({
  open,
  onClose,
  onSubmit,
  primaryBtnClass,
  categories,
  defaultAuthor = '',
  mode = 'create',
  initialPost = null,
}) {
  const isEdit = mode === 'edit'
  const [emoji, setEmoji] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(categories[0] ?? '썸 이야기')
  const [body, setBody] = useState('')
  const [nickname, setNickname] = useState(defaultAuthor)

  useEffect(() => {
    if (!open) return
    if (isEdit && initialPost) {
      setEmoji(initialPost.emoji || '')
      setTitle(initialPost.title || '')
      setBody(initialPost.body || initialPost.excerpt || '')
      setCategory(initialPost.category || categories[0] || '썸 이야기')
      setNickname(initialPost.author || defaultAuthor)
    } else {
      setEmoji('')
      setTitle('')
      setBody('')
      setNickname(defaultAuthor)
      setCategory(categories[0] ?? '썸 이야기')
    }
  }, [open, defaultAuthor, categories, isEdit, initialPost])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('제목을 입력해 주세요.')
      return
    }
    if (!body.trim()) {
      alert('본문을 입력해 주세요.')
      return
    }
    try {
      await onSubmit({
        emoji: emoji.trim(),
        title: title.trim(),
        category,
        body: body.trim(),
        nickname: nickname.trim(),
      })
      onClose()
    } catch {
      /* onSubmit에서 alert 처리 */
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-post-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-sm font-medium text-neutral-500 hover:text-[#171717]"
        >
          닫기
        </button>
        <h2 id="write-post-title" className="font-display pr-10 text-xl text-[#171717]">
          {isEdit ? '글 수정' : '글쓰기'}
        </h2>
        <p className="mt-1 text-xs text-neutral-500">로그인 후 작성한 글은 MongoDB에 저장되어 모든 사용자에게 보여요.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-neutral-800">
            이모지 (선택)
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
              placeholder="예: 💬"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
            />
          </label>
          <label className="block text-sm font-medium text-neutral-800">
            카테고리
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-800">
            제목
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
              placeholder="제목을 입력하세요"
            />
          </label>
          <label className="block text-sm font-medium text-neutral-800">
            본문
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              required
              className="mt-1.5 w-full resize-y rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
              placeholder="하고 싶은 이야기를 자유롭게 적어 주세요."
            />
          </label>
          <label className="block text-sm font-medium text-neutral-800">
            닉네임 (비우면 로그인 아이디 또는 ‘익명’)
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
              placeholder="표시할 이름"
            />
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-300 py-3 text-sm font-semibold text-[#171717] hover:bg-neutral-50"
            >
              취소
            </button>
            <button type="submit" className={`flex-1 ${primaryBtnClass}`}>
              {isEdit ? '수정하기' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function CommunityOpinionModal({ open, onClose, onSubmit, primaryBtnClass, outlineBtnClass }) {
  const [text, setText] = useState('')
  const [nickname, setNickname] = useState('')

  useEffect(() => {
    if (open) {
      setText('')
      setNickname('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) {
      alert('의견을 입력해 주세요.')
      return
    }
    onSubmit({
      text: text.trim(),
      nickname: nickname.trim(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="opinion-modal-title"
        className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-sm font-medium text-neutral-500 hover:text-[#171717]"
        >
          닫기
        </button>
        <h2 id="opinion-modal-title" className="font-display pr-10 text-xl text-[#171717]">
          의견 남기기
        </h2>
        <p className="mt-1 text-xs text-neutral-500">로그인 후 남긴 의견은 MongoDB에 저장돼요.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-neutral-800">
            의견
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              required
              className="mt-1.5 w-full resize-y rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
              placeholder="생각을 적어 주세요."
            />
          </label>
          <label className="block text-sm font-medium text-neutral-800">
            닉네임 (선택)
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-400"
              placeholder="비우면 로그인 아이디 또는 익명"
            />
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className={`flex-1 ${outlineBtnClass}`}>
              취소
            </button>
            <button type="submit" className={`flex-1 ${primaryBtnClass}`}>
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
