import { useEffect, useMemo, useState } from 'react'
import { fetchAnalysisHistory, toggleAnalysisFavorite, deleteAnalysisRecord } from '../api/analysisApi'

const EMOTION_META = [
  { key: 'happy', label: '행복', color: '#f4709a' },
  { key: 'flutter', label: '설렘', color: '#f9a8c4' },
  { key: 'indifferent', label: '무관심', color: '#b8a9e0' },
  { key: 'sad', label: '슬픔', color: '#cdd5ec' },
]

function formatDate(value) {
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function formatTime(value) {
  const d = new Date(value)
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h < 12 ? '오전' : '오후'
  const hh = h % 12 === 0 ? 12 : h % 12
  return `${ampm} ${hh}:${m}`
}

// 꺾은선 그래프 (최근 분석들의 썸 지수 추이)
function LineChart({ points }) {
  const width = 560
  const height = 220
  const padX = 36
  const padY = 28
  if (!points.length) return null

  const innerW = width - padX * 2
  const innerH = height - padY * 2
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0
  const coords = points.map((p, i) => ({
    x: padX + stepX * i + (points.length === 1 ? innerW / 2 : 0),
    y: padY + innerH - (p.value / 100) * innerH,
    ...p,
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padY + innerH} L ${coords[0].x} ${padY + innerH} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="썸 지수 변화 그래프">
      <defs>
        <linearGradient id="ssamArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4709a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f4709a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => {
        const y = padY + innerH - (g / 100) * innerH
        return (
          <g key={g}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#f1e7ec" strokeWidth="1" />
            <text x={8} y={y + 4} fontSize="10" fill="#b8b3bc">{g}%</text>
          </g>
        )
      })}
      <path d={areaPath} fill="url(#ssamArea)" />
      <path d={linePath} fill="none" stroke="#f4709a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="4.5" fill="#fff" stroke="#f4709a" strokeWidth="2.5" />
          <text x={c.x} y={c.y - 12} fontSize="11" fontWeight="600" fill="#f4709a" textAnchor="middle">{c.value}%</text>
          <text x={c.x} y={height - 8} fontSize="10" fill="#9b95a3" textAnchor="middle">{c.label}</text>
        </g>
      ))}
    </svg>
  )
}

// 감정 비율 도넛 차트
function DonutChart({ emotions }) {
  const size = 180
  const stroke = 26
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const total = EMOTION_META.reduce((sum, e) => sum + (emotions?.[e.key] || 0), 0) || 1

  let offset = 0
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-44 w-44" role="img" aria-label="감정 비율 도넛 차트">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {EMOTION_META.map((e) => {
          const value = emotions?.[e.key] || 0
          const len = (value / total) * circumference
          const seg = (
            <circle
              key={e.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={e.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={-offset}
            />
          )
          offset += len
          return seg
        })}
      </g>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="34">💗</text>
    </svg>
  )
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-5 shadow-[0_8px_30px_rgba(244,112,154,0.06)]">
      <div className="flex items-center gap-2 text-sm font-medium text-[#9b95a3]">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <p className={`mt-3 text-3xl font-bold ${accent || 'text-[#2a2a33]'}`}>{value}</p>
      {sub && <p className="mt-2 text-xs text-[#b0aab6]">{sub}</p>}
    </div>
  )
}

export default function MyAnalysisPage({ isLoggedIn, goHome, goAnalyze, requireLoginForAnalyze }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [compareA, setCompareA] = useState('')
  const [compareB, setCompareB] = useState('')

  const loadHistory = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAnalysisHistory()
      setRecords(data)
      if (data.length >= 2) {
        setCompareA(data[1]._id)
        setCompareB(data[0]._id)
      } else if (data.length === 1) {
        setCompareA(data[0]._id)
        setCompareB(data[0]._id)
      }
    } catch (err) {
      console.error(err)
      setError('분석 기록을 불러오지 못했어요. 서버 상태를 확인해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) loadHistory()
  }, [isLoggedIn])

  // 최신순 records 기준 통계 계산
  const stats = useMemo(() => {
    if (!records.length) return null
    const latest = records[0]
    const prev = records[1]
    const delta = prev ? latest.ssamScore - prev.ssamScore : null
    const favoriteCount = records.filter((r) => r.favorite).length
    const firstDate = records[records.length - 1].createdAt
    return { latest, prev, delta, favoriteCount, firstDate, total: records.length }
  }, [records])

  // 그래프용 데이터: 오래된 → 최신 순, 최근 8개
  const trendPoints = useMemo(() => {
    const ordered = [...records].reverse().slice(-8)
    return ordered.map((r) => ({ label: formatDate(r.createdAt).slice(5), value: r.ssamScore }))
  }, [records])

  const recordA = records.find((r) => r._id === compareA)
  const recordB = records.find((r) => r._id === compareB)

  const handleToggleFavorite = async (id) => {
    try {
      const res = await toggleAnalysisFavorite(id)
      setRecords((prev) => prev.map((r) => (r._id === id ? { ...r, favorite: res.favorite } : r)))
    } catch {
      alert('즐겨찾기 변경에 실패했어요.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('이 분석 기록을 삭제할까요?')) return
    try {
      await deleteAnalysisRecord(id)
      setRecords((prev) => prev.filter((r) => r._id !== id))
    } catch {
      alert('삭제에 실패했어요.')
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="mx-auto max-w-[480px] px-4 py-16 text-center sm:px-6">
        <button type="button" onClick={goHome} className="mb-8 text-sm font-semibold text-[#6b6570] hover:text-[#171717]">
          ← 홈으로
        </button>
        <h1 className="font-display text-2xl sm:text-3xl">MY 분석은 회원 전용이에요</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#6b6570]">
          로그인하면 그동안의 카톡 분석 기록을 날짜별 그래프로 확인할 수 있어요.
        </p>
        <button type="button" onClick={() => requireLoginForAnalyze('login')} className="mt-8 rounded-xl bg-[#f4709a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e85d8a]">
          로그인하기
        </button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl text-[#2a2a33] sm:text-4xl">MY 분석</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#9b95a3]">
            우리 사이의 모든 변화를 한눈에 확인해보세요.
            <br className="hidden sm:block" />
            AI가 분석한 데이터를 기반으로 더 좋은 관계를 만들어가요.
          </p>
        </div>
        <button type="button" onClick={goAnalyze} className="hidden rounded-xl bg-[#f4709a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e85d8a] sm:block">
          + 새 분석하기
        </button>
      </div>

      {loading && <p className="mt-12 text-center text-sm text-[#9b95a3]">분석 기록을 불러오는 중...</p>}
      {error && <p className="mt-12 text-center text-sm text-red-500">{error}</p>}

      {!loading && !error && !records.length && (
        <div className="mt-12 rounded-3xl border border-pink-100 bg-pink-50/40 p-12 text-center">
          <p className="text-3xl">📊</p>
          <h2 className="mt-4 text-lg font-bold text-[#2a2a33]">아직 분석 기록이 없어요</h2>
          <p className="mt-2 text-sm text-[#9b95a3]">카톡 분석을 하면 결과가 날짜별로 저장되어 변화를 그래프로 볼 수 있어요.</p>
          <button type="button" onClick={goAnalyze} className="mt-6 rounded-xl bg-[#f4709a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#e85d8a]">
            첫 분석 시작하기
          </button>
        </div>
      )}

      {!loading && stats && (
        <>
          {/* 통계 카드 */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon="📈" label="총 분석 횟수" value={`${stats.total}회`} sub={`첫 분석 ${formatDate(stats.firstDate)}`} />
            <StatCard
              icon="💗"
              label="최근 썸 지수"
              value={`${stats.latest.ssamScore}%`}
              accent="text-[#f4709a]"
              sub={stats.delta == null ? '첫 분석' : `${stats.delta >= 0 ? '▲' : '▼'} ${Math.abs(stats.delta)}% (지난 분석 대비)`}
            />
            <StatCard icon="📅" label="최근 분석일" value={formatDate(stats.latest.createdAt)} sub={formatTime(stats.latest.createdAt)} />
            <StatCard icon="⭐" label="즐겨찾기" value={`${stats.favoriteCount}개`} sub="중요한 분석을 모아보세요" />
          </section>

          {/* 그래프 영역 */}
          <section className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_8px_30px_rgba(244,112,154,0.06)]">
              <h2 className="text-lg font-bold text-[#2a2a33]">썸 지수 변화</h2>
              <p className="mt-1 text-xs text-[#b0aab6]">최근 분석 {trendPoints.length}회</p>
              <div className="mt-4">
                <LineChart points={trendPoints} />
              </div>
            </div>

            <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_8px_30px_rgba(244,112,154,0.06)]">
              <h2 className="text-lg font-bold text-[#2a2a33]">감정 비율 <span className="text-xs font-normal text-[#b0aab6]">(최근 분석)</span></h2>
              <div className="mt-4 flex items-center gap-6">
                <DonutChart emotions={stats.latest.emotions} />
                <ul className="space-y-3">
                  {EMOTION_META.map((e) => (
                    <li key={e.key} className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: e.color }} />
                      <span className="text-[#6b6570]">{e.label}</span>
                      <span className="font-semibold text-[#2a2a33]">{stats.latest.emotions?.[e.key] || 0}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 최근 분석 기록 */}
          <section className="mt-6 rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_8px_30px_rgba(244,112,154,0.06)]">
            <h2 className="text-lg font-bold text-[#2a2a33]">최근 분석 기록</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {records.slice(0, 6).map((r, idx) => (
                <div key={r._id} className={`relative rounded-2xl border p-4 ${idx === 0 ? 'border-pink-200 bg-pink-50/50' : 'border-neutral-100 bg-white'}`}>
                  {idx === 0 && <span className="absolute left-4 top-4 rounded-full bg-[#f4709a] px-2 py-0.5 text-[10px] font-bold text-white">최신</span>}
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => handleToggleFavorite(r._id)} className="text-lg leading-none" aria-label="즐겨찾기">
                      {r.favorite ? '⭐' : '☆'}
                    </button>
                    <button type="button" onClick={() => handleDelete(r._id)} className="text-sm text-[#c9c3cf] hover:text-red-400" aria-label="삭제">
                      ✕
                    </button>
                  </div>
                  <p className="mt-1 text-center text-2xl">💞</p>
                  <p className="mt-2 text-center text-sm font-semibold text-[#2a2a33]">{formatDate(r.createdAt)}</p>
                  <p className="text-center text-xs text-[#b0aab6]">{formatTime(r.createdAt)}</p>
                  <div className="mt-3 flex justify-around border-t border-pink-100 pt-3 text-center">
                    <div>
                      <p className="text-xs text-[#9b95a3]">썸 지수</p>
                      <p className="text-base font-bold text-[#f4709a]">{r.ssamScore}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9b95a3]">긍정도</p>
                      <p className="text-base font-bold text-[#b8a9e0]">{r.positivity}%</p>
                    </div>
                  </div>
                  {r.summary && <p className="mt-3 line-clamp-2 text-xs text-[#9b95a3]">{r.summary}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* 기간 비교 분석 */}
          {records.length >= 2 && recordA && recordB && (
            <section className="mt-6 rounded-3xl border border-pink-100 bg-white p-6 shadow-[0_8px_30px_rgba(244,112,154,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#2a2a33]">기간 비교 분석</h2>
                  <p className="mt-1 text-xs text-[#b0aab6]">원하는 분석 결과를 비교해보세요.</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <select value={compareA} onChange={(e) => setCompareA(e.target.value)} className="rounded-xl border border-pink-100 bg-white px-3 py-2 text-[#2a2a33] outline-none">
                    {records.map((r) => (
                      <option key={r._id} value={r._id}>{formatDate(r.createdAt)}</option>
                    ))}
                  </select>
                  <span className="text-[#b0aab6]">vs</span>
                  <select value={compareB} onChange={(e) => setCompareB(e.target.value)} className="rounded-xl border border-pink-100 bg-white px-3 py-2 text-[#2a2a33] outline-none">
                    {records.map((r) => (
                      <option key={r._id} value={r._id}>{formatDate(r.createdAt)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <CompareRow label="썸 지수" a={recordA.ssamScore} b={recordB.ssamScore} suffix="%" />
                <CompareRow label="긍정도" a={recordA.positivity} b={recordB.positivity} suffix="%" />
                <CompareRow label="행복 감정" a={recordA.emotions?.happy || 0} b={recordB.emotions?.happy || 0} suffix="%" />
                <CompareRow label="설렘 감정" a={recordA.emotions?.flutter || 0} b={recordB.emotions?.flutter || 0} suffix="%" />
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}

function CompareRow({ label, a, b, suffix }) {
  const diff = b - a
  return (
    <div className="grid grid-cols-[100px_1fr_60px] items-center gap-3 text-sm sm:grid-cols-[120px_1fr_80px]">
      <span className="font-medium text-[#6b6570]">{label}</span>
      <div className="flex items-center gap-3">
        <span className="w-12 text-right font-semibold text-[#9b95a3]">{a}{suffix}</span>
        <div className="relative h-2 flex-1 rounded-full bg-pink-50">
          <div className="absolute inset-y-0 left-0 rounded-full bg-pink-200" style={{ width: `${a}%` }} />
          <div className="absolute inset-y-0 left-0 rounded-full bg-[#f4709a]" style={{ width: `${b}%` }} />
        </div>
        <span className="w-12 font-semibold text-[#f4709a]">{b}{suffix}</span>
      </div>
      <span className={`text-right text-xs font-semibold ${diff >= 0 ? 'text-[#f4709a]' : 'text-[#b8a9e0]'}`}>
        {diff === 0 ? '동일' : `${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}`}
      </span>
    </div>
  )
}
