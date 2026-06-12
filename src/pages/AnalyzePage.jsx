import { useState, useRef, useEffect } from 'react'
import { relationshipTabs, genderOptions, trendingTests, primaryBtn, outlineBtn, MAX_CHAT_IMAGES, MAX_IMAGE_SIZE_MB } from '../data/constants'
import { analyzeRelationship } from '../api/analysisApi'

export default function AnalyzePage({ isLoggedIn, goHome, goBack, requireLoginForAnalyze, goAnalysisResult, setAnalysisResult }) {
  const [relationship, setRelationship] = useState('썸')
  const [myGender, setMyGender] = useState('여성')
  const [otherGender, setOtherGender] = useState('남성')
  const [storyText, setStoryText] = useState('')
  const [chatImages, setChatImages] = useState([])
  const [pickedTest, setPickedTest] = useState(trendingTests[0])
  const [isLoading, setIsLoading] = useState(false)
  const chatImageInputRef = useRef(null)

  useEffect(() => {
    return () => chatImages.forEach((img) => URL.revokeObjectURL(img.preview))
  }, [chatImages])

  const addChatImages = (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return

    const remaining = MAX_CHAT_IMAGES - chatImages.length
    if (remaining <= 0) {
      alert(`사진은 최대 ${MAX_CHAT_IMAGES}장까지 첨부할 수 있어요.`)
      return
    }

    const accepted = []
    for (const file of files.slice(0, remaining)) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 첨부할 수 있어요.')
        continue
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        alert(`사진 한 장당 ${MAX_IMAGE_SIZE_MB}MB 이하만 가능해요.`)
        continue
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      })
    }

    if (accepted.length) setChatImages((prev) => [...prev, ...accepted])
  }

  const removeChatImage = (id) => {
    setChatImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((img) => img.id !== id)
    })
  }

  // 이미지를 압축하여 Base64로 변환하는 함수
  const compressImageToBase64 = (file) => {
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
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width)
              width = maxDim
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height)
              height = maxDim
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
          const base64Data = compressedBase64.split(',')[1]
          resolve({ data: base64Data, mediaType: 'image/jpeg' })
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleAnalyzeSubmit = async () => {
    if (!isLoggedIn) {
      requireLoginForAnalyze('login')
      return
    }

    const hasText = storyText.trim().length > 0
    const hasImages = chatImages.length > 0

    if (!hasText && !hasImages) {
      alert('상황을 설명하거나 카카오톡 사진을 첨부해 주세요.')
      return
    }

    setIsLoading(true)
    try {
      let imageDataList = []
      if (hasImages) {
        imageDataList = await Promise.all(
          chatImages.map((img) => compressImageToBase64(img.file))
        )
      }

      const result = await analyzeRelationship({
        myGender,
        otherGender,
        relationship,
        storyType: '상황설명',
        storyText,
        test: pickedTest,
        chatImages: imageDataList
      })

      if (result.success) {
        setAnalysisResult({
          analysis: result.analysis,
          metadata: result.metadata,
          storyText
        })
        goAnalysisResult()
      } else {
        alert(result.message || '분석 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('❌ 분석 에러:', error.message)
      const errorMessage = error.message || '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      alert(`분석 실패: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="mx-auto max-w-[480px] px-4 py-16 text-center sm:px-6">
        <button
          type="button"
          onClick={goHome}
          className="mb-8 text-sm font-semibold text-[#6b6570] hover:text-[#171717]"
        >
          ← 홈으로
        </button>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">Members only</p>
        <h1 className="font-display mt-3 text-2xl sm:text-3xl">회원 전용 기능이에요</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#6b6570]">
          카카오톡 분석은 가입한 회원만 이용할 수 있어요.
          <br />
          로그인하거나 회원가입 후 이용해 주세요.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => requireLoginForAnalyze('login')} className={primaryBtn}>
            로그인
          </button>
          <button type="button" onClick={() => requireLoginForAnalyze('signup')} className={outlineBtn}>
            회원가입
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[720px] px-4 py-8 sm:px-6 sm:py-12">
      <button
        type="button"
        onClick={goBack || goHome}
        className="mb-6 text-sm font-semibold text-[#6b6570] hover:text-[#171717]"
      >
        ← 분석 방식 선택
      </button>
      <h1 className="font-display text-2xl sm:text-3xl">분석 리포트</h1>
      <p className="mt-2 text-sm text-[#6b6570]">
        상황을 설명하거나 카카오톡 사진을 첨부하면 AI가 한 번에 정리된 리포트를 만들어 드려요.
      </p>

      <div className="mt-8 rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-8">
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
                    ? 'border-[#171717] bg-[#171717] text-white shadow-md shadow-neutral-300/40'
                    : 'border-neutral-200 bg-white text-[#4a4550] hover:border-neutral-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[#5f3f5d]">
            내 성별
            <select
              value={myGender}
              onChange={(e) => setMyGender(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[#2a2a33] outline-none focus:border-[#171717]"
            >
              {genderOptions.map((gender) => (
                <option key={`me-${gender}`} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[#5f3f5d]">
            상대방 성별
            <select
              value={otherGender}
              onChange={(e) => setOtherGender(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-[#2a2a33] outline-none focus:border-[#171717]"
            >
              {genderOptions.map((gender) => (
                <option key={`other-${gender}`} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold text-[#2a2a33]">상황 설명</p>
          <textarea
            rows={8}
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            placeholder="지금 상황을 자세히 적어주세요. 마지막 연락, 감정 상태, 고민 포인트 등"
            className="mt-3 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#2a2a33] placeholder:text-[#b8b3bc] outline-none focus:border-[#171717]"
          />

          <div className="mt-4">
            <p className="text-sm font-semibold text-[#2a2a33]">카카오톡 스크린샷 (선택)</p>
            <input
              ref={chatImageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                addChatImages(e.target.files)
                e.target.value = ''
              }}
            />
            <button
              type="button"
              onClick={() => chatImageInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                addChatImages(e.dataTransfer.files)
              }}
              className="mt-3 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center transition hover:border-neutral-400 hover:bg-neutral-100/80"
            >
              <span className="text-2xl" aria-hidden>📷</span>
              <span className="mt-2 text-sm font-semibold text-[#171717]">사진 선택 또는 드래그</span>
              <span className="mt-1 text-xs text-[#6b6570]">
                JPG, PNG · 최대 {MAX_CHAT_IMAGES}장 · 장당 {MAX_IMAGE_SIZE_MB}MB
              </span>
            </button>

            {chatImages.length > 0 && (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {chatImages.map((img) => (
                  <li key={img.id} className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <img
                      src={img.preview}
                      alt={img.name}
                      className="aspect-[9/16] w-full object-cover object-top"
                    />
                    <button
                      type="button"
                      onClick={() => removeChatImage(img.id)}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#171717]/80 text-xs font-bold text-white transition hover:bg-[#171717]"
                      aria-label={`${img.name} 삭제`}
                    >
                      ×
                    </button>
                    <p className="truncate px-2 py-1.5 text-[10px] text-[#6b6570]">{img.name}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-100/50 px-4 py-3 text-xs text-[#6b6570]">
          참고 테스트: <span className="font-bold text-[#2a2a33]">{pickedTest}</span>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-[#2a2a33]">테스트 선택</p>
          <div className="flex flex-wrap gap-2">
            {trendingTests.map((test) => (
              <button
                key={test}
                type="button"
                onClick={() => setPickedTest(test)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  pickedTest === test
                    ? 'border-[#171717] bg-neutral-100 font-semibold text-[#171717]'
                    : 'border-neutral-200 bg-white text-[#4a4550] hover:border-neutral-400'
                }`}
              >
                {test}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAnalyzeSubmit}
          disabled={isLoading}
          className={`${primaryBtn} mt-6 w-full disabled:opacity-60 disabled:cursor-not-allowed transition`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block animate-spin">⏳</span>
              분석 중이에요... (1-2분 소요)
            </span>
          ) : (
            `${relationship} 관계 분석 리포트 받기`
          )}
        </button>
      </div>
    </main>
  )
}
