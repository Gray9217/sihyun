/** 브라우저에만 저장되는 글 / 의견 (JSON 파일과 합쳐서 표시) */
export const LS_USER_POSTS = 'ssam_community_user_posts'
export const LS_OPINIONS = 'ssam_community_opinions'

const CATEGORY_STYLES = {
  '썸 이야기': 'bg-violet-50 text-violet-900 ring-1 ring-violet-100',
  '연애 고민': 'bg-rose-50 text-rose-800 ring-1 ring-rose-100',
  '대화 분석': 'bg-sky-50 text-sky-900 ring-1 ring-sky-100',
  이별: 'bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200',
}

export function getCategoryTagClass(category) {
  return CATEGORY_STYLES[category] ?? 'bg-neutral-100 text-neutral-800 ring-1 ring-neutral-200'
}

export function enrichPost(post) {
  return {
    ...post,
    tagClass: getCategoryTagClass(post.category),
  }
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '')
}

function getPostSearchText(post) {
  return [post.title, post.excerpt, post.body, post.category].filter(Boolean).join(' ')
}

export function matchesCommunitySearch(post, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = getPostSearchText(post).toLowerCase()
  const qNorm = normalizeText(q)
  const hayNorm = normalizeText(haystack)

  return haystack.includes(q) || hayNorm.includes(qNorm)
}

export function matchesCommunityTag(post, tag, tagMap) {
  const config = tagMap[tag]
  if (!config) return matchesCommunitySearch(post, tag.replace('#', ''))

  if (config.category && post.category === config.category) return true

  const hayNorm = normalizeText(getPostSearchText(post))
  return (config.keywords || []).some((kw) => hayNorm.includes(normalizeText(kw)))
}

/** 작성자만 수정 가능 (authorId 우선, 없으면 닉네임=로그인 아이디) */
export function isPostOwner(post, { userId = '', username = '' } = {}) {
  if (!post || post.readOnly) return false
  if (post.isOwner) return true
  if (userId && post.authorId) return String(userId) === String(post.authorId)
  if (username && post.author) return post.author === username
  return false
}

/** 작성자 또는 관리자가 삭제 가능 */
export function canDeletePost(post, { userId = '', username = '', isAdmin = false } = {}) {
  if (!post || post.readOnly) return false
  if (isAdmin) return true
  return isPostOwner(post, { userId, username })
}

export function loadUserPosts() {
  try {
    const raw = localStorage.getItem(LS_USER_POSTS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveUserPosts(posts) {
  localStorage.setItem(LS_USER_POSTS, JSON.stringify(posts))
}

export function loadOpinions() {
  try {
    const raw = localStorage.getItem(LS_OPINIONS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveOpinions(rows) {
  localStorage.setItem(LS_OPINIONS, JSON.stringify(rows))
}
