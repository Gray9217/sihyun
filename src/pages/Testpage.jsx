import { testCategories } from '../data/testData'

export default function TestsPage({ openTestDetail }) {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-[#171717]">연애 심리 테스트</div>
        <h1 className="mt-5 text-4xl font-black">지금 바로<br />연애 테스트 해보세요</h1>
      </div>

      <div className="mt-14 space-y-12">
        {testCategories.map((section) => (
          <section key={section.category}>
            <h2 className="text-2xl font-black mb-5">{section.category}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {section.tests.map((test) => (
                <article key={test.title} className="group rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-neutral-400">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-3xl">{test.icon}</div>
                  <h3 className="mt-5 text-xl font-black leading-snug">{test.title}</h3>
                  <p className="mt-3 text-sm text-[#6b6570]">{test.desc}</p>
                  <button type="button" onClick={() => openTestDetail(test)} className="mt-6 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#404040]">
                    테스트 시작하기 →
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}