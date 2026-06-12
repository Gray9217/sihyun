export const relationshipTabs = ['썸', '짝사랑', '연애중', '헤어짐']
export const genderOptions = ['여성', '남성', '기타']

export const trendingTests = [
  '우리의 연애 스타일은?',
  '대화 온도 체크 테스트',
  '썸 성공 확률 분석',
  '헤어진 후 재회 가능성',
]

export const specialFeatures = []

export const navCenter = ['테스트', '카톡분석', '커뮤니티', 'MY분석', '썸앤쌈 SOS']
export const communityCategories = ['전체', '썸 이야기', '연애 고민', '대화 분석', '이별']
export const communityWriteCategories = communityCategories.filter((c) => c !== '전체')

/** 인기 태그 클릭 시 카테고리·키워드 매칭 */
export const communityTagMap = {
  '#썸': { category: '썸 이야기', keywords: ['썸', '호감', '좋아'] },
  '#연애고민': { category: '연애 고민', keywords: ['연애', '고민', '상담'] },
  '#카톡분석': { category: '대화 분석', keywords: ['카톡', '대화', '분석', '메시지'] },
  '#답장': { category: '대화 분석', keywords: ['답장', '연락', '읽씹', '안읽씹'] },
  '#고백': { category: '썸 이야기', keywords: ['고백', '짝사랑', '좋아해'] },
  '#이별': { category: '이별', keywords: ['이별', '헤어', '재회', '전연인'] },
  '#썸타는중': { category: '썸 이야기', keywords: ['썸', '썸타', '애매'] },
  '#연애상담': { category: '연애 고민', keywords: ['연애', '상담', '고민'] },
}
export const COMMUNITY_PAGE_SIZE = 5
export const MAX_CHAT_IMAGES = 5
export const MAX_IMAGE_SIZE_MB = 5

export const primaryBtn = 'rounded-xl bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#404040] active:scale-[0.99]'
export const outlineBtn = 'rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-[#171717] transition hover:bg-neutral-50'
export const gradientCtaBtn = 'rounded-xl bg-[#171717] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#404040] active:scale-[0.99]'