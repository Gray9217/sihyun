import StatInsightCard from '../components/common/StatInsightCard'
import KakaoLoginButton from '../components/common/KakaoLoginButton'
import mainImg from '../assets/image.png'
import { primaryBtn, outlineBtn, gradientCtaBtn, specialFeatures } from '../data/constants'
import { featuredHomeTests } from '../data/testData'

export default function HomePage({ goAnalyze, goTests, openTestDetail, openAuthModal }) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-neutral-100 bg-[#fafafa] pb-16 pt-12 sm:pb-24 sm:pt-16">
        <div className="pointer-events-none absolute inset-0 hero-grid-bg" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">AI Relationship Analysis</p>
            <h1 className="font-display mt-4 text-[2.5rem] leading-[1.12] text-[#171717] sm:text-5xl lg:text-[3.25rem]">
              카톡만 봐도<br />썸인지 알 수 있어요
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-600">
              AI가 대화 내용을 분석해 두 사람의 관계와 마음의 온도를 데이터로 보여드립니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={goAnalyze} className={primaryBtn + ' inline-flex items-center gap-2'}>
                카톡 분석 시작하기<span aria-hidden>→</span>
              </button>
              <button type="button" onClick={() => document.getElementById('popular')?.scrollIntoView({ behavior: 'smooth' })} className={outlineBtn}>
                인기 테스트 보기
              </button>
            </div>
          </div>
          <div className="relative flex items-center justify-center lg:justify-end">
            <button type="button" onClick={goAnalyze} className="group w-full max-w-[540px] transition hover:opacity-[0.98] lg:max-w-none">
              <img src={mainImg} alt="메인 이미지" className="h-full w-full object-cover object-center" />
            </button>
          </div>
        </div>
      </section>

      <section id="popular" className="scroll-mt-24 border-t border-neutral-100 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl sm:text-3xl">많이 분석받는 주제</h2>
            <button type="button" onClick={goTests} className="shrink-0 text-sm font-semibold text-[#171717] hover:underline">
              더보기 →
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-5">
            {featuredHomeTests.map((test) => (
              <article key={test.title} onClick={() => openTestDetail(test)} className="card-hover flex min-w-[200px] shrink-0 cursor-pointer flex-col rounded-xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition hover:border-neutral-400 sm:min-w-0">
                <div className="flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-50 text-5xl">{test.icon}</div>
                <h3 className="mt-4 text-sm font-bold leading-snug">{test.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#6b6570]">{test.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f5] py-12 sm:py-16">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:overflow-hidden lg:rounded-[1.75rem] lg:bg-[#f5f5f5] lg:shadow-[0_16px_48px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col justify-center rounded-[1.75rem] bg-[#f5f5f5] px-6 py-10 sm:px-10 lg:rounded-none lg:py-14">
            <p className="text-sm font-bold text-[#171717]">분석 미리보기</p>
            <h2 className="font-display mt-3 text-2xl leading-snug text-[#171717] sm:text-[1.65rem]">AI가 분석한<br />대화 흐름이에요</h2>
            <button type="button" onClick={goAnalyze} className={`${gradientCtaBtn} mt-8 w-full max-w-[260px]`}>분석 예시 더 보기</button>
          </div>
          <div className="flex flex-col gap-3 rounded-[1.75rem] border border-white/80 bg-white/60 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-6 lg:rounded-none lg:border-0 lg:border-l lg:border-solid lg:border-neutral-200/50 lg:bg-[#f5f5f5] lg:px-8 lg:py-10 lg:shadow-none">
            <StatInsightCard icon="🕐" label="답장 속도" value="평균 2분 36초" hint="빠른 편이에요!" />
            <StatInsightCard icon="💝" label="관심 표현" value="총 18회" hint="관심 표현이 많아요!" />
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#171717] to-[#404040] p-5 text-white shadow-lg shadow-neutral-900/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold opacity-95">썸 지수</p>
                  <p className="mt-2 text-5xl font-black leading-none">76<span className="text-2xl font-bold">%</span></p>
                </div>
                <span className="text-5xl drop-shadow-md" aria-hidden>💘</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="font-display text-center text-2xl sm:text-3xl">썸앤쌈이 제공하는 분석</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {specialFeatures.map((f) => (
              <article key={f.title} className="card-hover rounded-[1.5rem] border border-neutral-200 bg-white p-6 shadow-[0_8px_28px_rgba(0,0,0,0.05)]">
                <div className="text-4xl">{f.icon}</div>
                <h3 className="mt-4 text-base font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#6b6570]">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      
      <section className="mx-auto max-w-[1200px] px-4 pb-16 pt-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#171717] px-6 py-12 text-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] sm:px-12 sm:py-14">
          <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <p className="font-display max-w-xl text-2xl leading-snug sm:text-3xl">지금 바로 썸앤쌈에서<br />우리의 관계를 분석해보세요</p>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:w-auto">
              <button type="button" onClick={() => openAuthModal('signup')} className="rounded-full bg-white px-6 py-3 text-center text-sm font-bold text-[#171717] shadow-lg transition hover:bg-neutral-100">회원가입</button>
              <KakaoLoginButton className="rounded-full sm:w-auto sm:min-w-[180px]" />
              <button type="button" onClick={goAnalyze} className={primaryBtn + ' border-2 border-white/90 shadow-lg'}>카톡 분석 시작하기</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}