import { useEffect, useState } from 'react'
import {
  createPostComment,
  deleteCommunityPost,
  fetchCommunityPost,
  fetchPostComments,
  getCurrentUserId,
  isAdmin,
  updateCommunityPost,
} from '../api/communityApi.js'
import { enrichPost, getCategoryTagClass, canDeletePost, isPostOwner } from '../communityStorage.js'
import { CommunityWriteModal } from '../components/CommunityModals.jsx'

function normalizePost(raw, loggedInUser) {
  if (!raw?.id) return null
  const base = enrichPost(raw)
  const author = base.author || '익명'
  const userId = getCurrentUserId()
  const admin = isAdmin()
  return {
    ...base,
    author,
    initial: base.initial || author.slice(0, 1),
    body: base.body || base.excerpt || '',
    excerpt: base.excerpt || base.body || '',
    isOwner: isPostOwner(base, { userId, username: loggedInUser }),
    canDelete: canDeletePost(base, { userId, username: loggedInUser, isAdmin: admin }),
    canModerate: Boolean(base.canModerate) || (admin && !isPostOwner(base, { userId, username: loggedInUser })),
  }
}

export function CommunityPostPage({
  header,
  post: initialPost,
  isLoggedIn,
  loggedInUser,
  onBack,
  onRequireLogin,
  onLikeClick,
  onPostUpdated,
  onPostDeleted,
  onCommentCountUpdate,
  primaryBtnClass,
  outlineBtnClass,
  writeCategories,
}) {
  const [post, setPost] = useState(() => normalizePost(initialPost, loggedInUser))
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setPost(normalizePost(initialPost, loggedInUser))
  }, [initialPost, loggedInUser])

  useEffect(() => {
    if (!initialPost?.id || initialPost.readOnly) return
    let cancelled = false
    fetchCommunityPost(initialPost.id)
      .then((fresh) => {
        if (cancelled) return
        setPost((prev) =>
          normalizePost(
            {
              ...(prev || initialPost),
              ...fresh,
            },
            loggedInUser
          )
        )
      })
      .catch((err) => {
        console.log('게시글 새로고침 실패:', err.response?.status ?? err.message)
      })
    return () => {
      cancelled = true
    }
  }, [initialPost?.id, initialPost?.readOnly, loggedInUser])

  const readOnly = Boolean(post?.readOnly)
  const isOwner = Boolean(post?.isOwner)
  const canDelete = Boolean(post?.canDelete)
  const canModerate = Boolean(post?.canModerate)

  useEffect(() => {
    if (!post?.id || readOnly) {
      setComments([])
      return
    }
    let cancelled = false
    setLoadingComments(true)
    fetchPostComments(post.id)
      .then((rows) => {
        if (!cancelled) setComments(rows)
      })
      .catch(() => {
        if (!cancelled) setComments([])
      })
      .finally(() => {
        if (!cancelled) setLoadingComments(false)
      })
    return () => {
      cancelled = true
    }
  }, [post?.id, readOnly])

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f7f7f8] text-[#171717]">
        <main className="mx-auto max-w-[720px] px-4 py-16 text-center">
          <p className="text-sm font-medium text-neutral-600">게시글을 찾을 수 없습니다.</p>
          <p className="mt-2 text-xs text-neutral-500">목록에서 다시 선택해 주세요.</p>
          <button type="button" onClick={onBack} className={`mt-6 ${outlineBtnClass}`}>
            커뮤니티로 돌아가기
          </button>
        </main>
      </div>
    )
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      onRequireLogin()
      return
    }
    if (readOnly || !commentText.trim()) return
    setSubmittingComment(true)
    try {
      const data = await createPostComment(post.id, {
        text: commentText.trim(),
        nickname: loggedInUser,
      })
      setComments((prev) => [...prev, data.comment])
      setCommentText('')
      setPost((p) => ({ ...p, comments: data.commentCount }))
      onCommentCountUpdate?.(post.id, data.commentCount)
    } catch (err) {
      alert(err.response?.data?.message ?? '댓글 등록에 실패했습니다.')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleLike = () => {
    if (readOnly) return
    if (!isLoggedIn) {
      onRequireLogin()
      return
    }
    onLikeClick?.(post, (updated) => {
      setPost((p) => ({ ...p, ...updated }))
    })
  }

  const handleEditSubmit = async (payload) => {
    try {
      const updated = await updateCommunityPost(post.id, payload)
      const next = normalizePost(updated, loggedInUser)
      setPost(next)
      onPostUpdated?.(next)
      alert('글이 수정되었습니다.')
    } catch (err) {
      alert(err.response?.data?.message ?? '글 수정에 실패했습니다.')
      throw new Error('edit failed')
    }
  }

  const handleDelete = async () => {
    if (!canDelete) return
    const message = canModerate
      ? '관리자 권한으로 이 글을 삭제할까요? 댓글도 함께 삭제됩니다.'
      : '이 글을 삭제할까요? 댓글도 함께 삭제됩니다.'
    if (!window.confirm(message)) return
    setDeleting(true)
    try {
      await deleteCommunityPost(post.id)
      onPostDeleted?.(post.id)
      alert('글이 삭제되었습니다.')
      onBack()
    } catch (err) {
      alert(err.response?.data?.message ?? '글 삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#171717]">
      <main className="mx-auto max-w-[720px] px-4 py-8 sm:px-6 sm:py-12">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 text-sm font-semibold text-[#6b6570] hover:text-[#171717]"
        >
          ← 커뮤니티 목록
        </button>

        <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${post.tagClass || getCategoryTagClass(post.category)}`}
              >
                {post.category || '커뮤니티'}
              </span>
              {(isOwner || canModerate) && !readOnly && (
                <div className="flex gap-2">
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-neutral-50"
                    >
                      수정
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      {deleting ? '삭제 중…' : canModerate ? '관리자 삭제' : '삭제'}
                    </button>
                  )}
                </div>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-snug text-[#171717] sm:text-3xl">
              {post.emoji ? <span className="mr-2">{post.emoji}</span> : null}
              {post.title || '(제목 없음)'}
            </h1>

            <div className="mt-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700"
                aria-hidden
              >
                {post.initial}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-neutral-800">{post.author}</p>
                <p className="text-xs text-neutral-500">{post.time || ''}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <div className="whitespace-pre-wrap text-base leading-relaxed text-neutral-800">
              {post.body || post.excerpt || '내용이 없습니다.'}
            </div>

            <div className="mt-8 flex items-center gap-5 border-t border-neutral-100 pt-6">
              <button
                type="button"
                disabled={readOnly}
                onClick={handleLike}
                className={`inline-flex items-center gap-1.5 text-sm font-semibold transition ${
                  post.liked ? 'text-rose-600' : 'text-neutral-600 hover:text-rose-600'
                } ${readOnly ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <span aria-hidden>{post.liked ? '♥' : '♡'}</span>
                좋아요 {post.likes ?? 0}
              </button>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500">
                <span aria-hidden>💬</span>
                댓글 {post.comments ?? 0}
              </span>
            </div>

            {readOnly ? (
              <p className="mt-8 text-xs text-neutral-500">
                고정 안내 글은 좋아요·댓글·수정·삭제를 할 수 없어요.
              </p>
            ) : (
              <section className="mt-10">
                <h2 className="text-sm font-bold text-[#171717]">댓글</h2>
                {loadingComments ? (
                  <p className="mt-4 text-xs text-neutral-500">댓글 불러오는 중…</p>
                ) : comments.length === 0 ? (
                  <p className="mt-4 text-xs text-neutral-500">첫 댓글을 남겨 보세요.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {comments.map((c) => (
                      <li key={c.id} className="rounded-xl border border-neutral-100 bg-neutral-50 px-4 py-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-neutral-800">{c.author}</span>
                          <span className="text-xs text-neutral-400">{c.time}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-700">{c.text}</p>
                      </li>
                    ))}
                  </ul>
                )}

                {isLoggedIn ? (
                  <form onSubmit={handleCommentSubmit} className="mt-6 space-y-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={4}
                      placeholder="댓글을 입력하세요"
                      className="w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm text-[#171717] outline-none focus:border-neutral-400"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className={`${primaryBtnClass} disabled:opacity-60`}
                    >
                      {submittingComment ? '등록 중…' : '댓글 등록'}
                    </button>
                  </form>
                ) : (
                  <p className="mt-6 text-sm text-neutral-500">
                    댓글을 남기려면{' '}
                    <button
                      type="button"
                      onClick={onRequireLogin}
                      className="font-semibold text-[#171717] underline"
                    >
                      로그인
                    </button>
                    이 필요해요.
                  </p>
                )}
              </section>
            )}
          </div>
        </article>
      </main>

      {isEditModalOpen && (
        <CommunityWriteModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          primaryBtnClass={primaryBtnClass}
          categories={writeCategories}
          defaultAuthor={loggedInUser || ''}
          mode="edit"
          initialPost={post}
        />
      )}
    </div>
  )
}
