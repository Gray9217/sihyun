import { CommunityPostPage } from './CommunityPostPage.jsx'
import communityContent from '../data/communityContent.json'
import { enrichPost } from '../communityStorage.js'
import { togglePostLike } from '../api/communityApi.js'
import { primaryBtn, outlineBtn, communityWriteCategories } from '../data/constants.js'

export default function CommunityPostWrapper({
  viewingPost,
  viewingPostId,
  communityDbPosts,
  setCommunityDbPosts,
  setViewingPost,
  setViewingPostId,
  isLoggedIn,
  loggedInUser,
  goCommunity,
  requireLoginForCommunity,
  header
}) {
  const filePostRows = Array.isArray(communityContent.posts) ? communityContent.posts : []
  const filePosts = filePostRows.map((p, i) => enrichPost({ ...p, id: p.id || `json-${i}`, author: p.author || '익명', readOnly: true, liked: false }))
  
  const postForPage = viewingPost ?? communityDbPosts.find((p) => p.id === viewingPostId) ?? filePosts.find((p) => p.id === viewingPostId) ?? null

  const syncPostInList = (updated) => {
    setCommunityDbPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
    setViewingPost((p) => (p?.id === updated.id ? { ...p, ...updated } : p))
  }

  const handleToggleLikeOnPage = async (post, onLocalUpdate) => {
    if (!isLoggedIn) return requireLoginForCommunity()
    if (post.readOnly) return
    try {
      const data = await togglePostLike(post.id)
      const patch = { likes: data.likes, liked: data.liked }
      setCommunityDbPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, ...patch } : p)))
      onLocalUpdate?.(patch)
    } catch (error) { alert('좋아요 처리에 실패했습니다.') }
  }

  const handlePostDeleted = (postId) => {
    setCommunityDbPosts((prev) => prev.filter((p) => p.id !== postId))
    setViewingPost(null)
    setViewingPostId(null)
  }

  return (
    <CommunityPostPage
      key={viewingPostId || 'no-post'}
      header={header}
      post={postForPage}
      isLoggedIn={isLoggedIn}
      loggedInUser={loggedInUser}
      onBack={goCommunity}
      onRequireLogin={requireLoginForCommunity}
      onLikeClick={handleToggleLikeOnPage}
      onPostUpdated={syncPostInList}
      onPostDeleted={handlePostDeleted}
      primaryBtnClass={primaryBtn}
      outlineBtnClass={outlineBtn}
      writeCategories={communityWriteCategories}
    />
  )
}