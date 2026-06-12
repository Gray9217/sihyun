const express = require('express')
const mongoose = require('mongoose')
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const Opinion = require('../models/Opinion')
const { requireAuth, optionalAuth } = require('../middleware/auth')

const router = express.Router()

function formatTime(date) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return d.toLocaleDateString('ko-KR')
}

function mapPost(post, user) {
  const likedBy = post.likedBy || []
  const uid = user?.id ? String(user.id) : null
  const authorId = post.authorId ? String(post.authorId) : null
  const isOwner = uid && authorId ? uid === authorId : false
  const isAdmin = user?.role === 'admin'
  return {
    id: post._id.toString(),
    emoji: post.emoji || undefined,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    category: post.category,
    author: post.author,
    authorId,
    initial: (post.author || '?').slice(0, 1),
    time: formatTime(post.createdAt),
    likes: likedBy.length,
    comments: post.commentCount ?? 0,
    liked: uid ? likedBy.some((id) => String(id) === uid) : false,
    isOwner,
    canModerate: isAdmin && !isOwner,
    source: 'db',
    readOnly: false,
  }
}

async function getPostWithCommentCount(postId) {
  if (!mongoose.Types.ObjectId.isValid(postId)) return null
  const post = await Post.findById(postId)
  if (!post) return null
  const commentCount = await Comment.countDocuments({ postId: post._id })
  return { post, commentCount }
}

function assertPostOwner(post, user) {
  if (!post) return { status: 404, message: '글을 찾을 수 없습니다.' }
  if (String(post.authorId) !== String(user.id)) {
    return { status: 403, message: '수정·삭제 권한이 없습니다.' }
  }
  return null
}

function assertCanDeletePost(post, user) {
  if (!post) return { status: 404, message: '글을 찾을 수 없습니다.' }
  if (user?.role === 'admin') return null
  if (String(post.authorId) !== String(user.id)) {
    return { status: 403, message: '삭제 권한이 없습니다.' }
  }
  return null
}

// 게시글 목록 (비로그인도 조회, 로그인 시 liked 표시)
router.get('/posts', optionalAuth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean()
    const ids = posts.map((p) => p._id)
    const counts =
      ids.length > 0
        ? await Comment.aggregate([
            { $match: { postId: { $in: ids } } },
            { $group: { _id: '$postId', count: { $sum: 1 } } },
          ])
        : []
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]))

    const rows = posts.map((p) => {
      const withCount = { ...p, commentCount: countMap[String(p._id)] || 0 }
      return mapPost(withCount, req.user)
    })

    res.json({ posts: rows })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '게시글을 불러오지 못했습니다.' })
  }
})

// 게시글 작성
router.post('/posts', requireAuth, async (req, res) => {
  try {
    const { emoji, title, category, body, nickname } = req.body
    if (!title?.trim() || !body?.trim() || !category?.trim()) {
      return res.status(400).json({ message: '제목, 본문, 카테고리를 입력해 주세요.' })
    }

    const text = body.trim()
    const author = (nickname || req.user.username || '익명').trim()
    const excerpt = text.length > 180 ? `${text.slice(0, 180)}…` : text

    const post = await Post.create({
      emoji: (emoji || '').trim(),
      title: title.trim(),
      body: text,
      excerpt,
      category: category.trim(),
      author,
      authorId: req.user.id,
      likedBy: [],
    })

    res.status(201).json({ post: mapPost({ ...post.toObject(), commentCount: 0 }, req.user) })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '글 등록에 실패했습니다.' })
  }
})

// 게시글 단건 조회
router.get('/posts/:id', optionalAuth, async (req, res) => {
  try {
    const found = await getPostWithCommentCount(req.params.id)
    if (!found) {
      return res.status(404).json({ message: '글을 찾을 수 없습니다.' })
    }
    res.json({
      post: mapPost({ ...found.post.toObject(), commentCount: found.commentCount }, req.user),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '게시글을 불러오지 못했습니다.' })
  }
})

// 게시글 수정 (작성자만)
router.put('/posts/:id', requireAuth, async (req, res) => {
  try {
    const found = await getPostWithCommentCount(req.params.id)
    const denied = assertPostOwner(found?.post, req.user)
    if (denied) {
      return res.status(denied.status).json({ message: denied.message })
    }

    const { emoji, title, category, body, nickname } = req.body
    if (!title?.trim() || !body?.trim() || !category?.trim()) {
      return res.status(400).json({ message: '제목, 본문, 카테고리를 입력해 주세요.' })
    }

    const text = body.trim()
    const post = found.post
    post.emoji = (emoji || '').trim()
    post.title = title.trim()
    post.body = text
    post.excerpt = text.length > 180 ? `${text.slice(0, 180)}…` : text
    post.category = category.trim()
    if (nickname?.trim()) post.author = nickname.trim()
    await post.save()

    res.json({
      post: mapPost({ ...post.toObject(), commentCount: found.commentCount }, req.user),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '글 수정에 실패했습니다.' })
  }
})

// 게시글 삭제 (작성자 또는 관리자)
router.delete('/posts/:id', requireAuth, async (req, res) => {
  try {
    const found = await getPostWithCommentCount(req.params.id)
    const denied = assertCanDeletePost(found?.post, req.user)
    if (denied) {
      return res.status(denied.status).json({ message: denied.message })
    }

    await Comment.deleteMany({ postId: found.post._id })
    await Post.findByIdAndDelete(found.post._id)

    res.json({ message: '글이 삭제되었습니다.' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '글 삭제에 실패했습니다.' })
  }
})

// 좋아요 토글
router.post('/posts/:id/like', requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: '글을 찾을 수 없습니다.' })
    }

    const uid = req.user.id
    const idx = post.likedBy.findIndex((id) => String(id) === uid)
    if (idx >= 0) {
      post.likedBy.splice(idx, 1)
    } else {
      post.likedBy.push(uid)
    }
    await post.save()

    const commentCount = await Comment.countDocuments({ postId: post._id })
    res.json({
      likes: post.likedBy.length,
      liked: idx < 0,
      post: mapPost({ ...post.toObject(), commentCount }, req.user),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '좋아요 처리에 실패했습니다.' })
  }
})

// 댓글 목록
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .sort({ createdAt: 1 })
      .lean()

    res.json({
      comments: comments.map((c) => ({
        id: c._id.toString(),
        text: c.text,
        author: c.author,
        at: c.createdAt,
        time: formatTime(c.createdAt),
      })),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '댓글을 불러오지 못했습니다.' })
  }
})

// 댓글 작성
router.post('/posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const { text, nickname } = req.body
    if (!text?.trim()) {
      return res.status(400).json({ message: '댓글 내용을 입력해 주세요.' })
    }

    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: '글을 찾을 수 없습니다.' })
    }

    const author = (nickname || req.user.username || '익명').trim()
    const comment = await Comment.create({
      postId: post._id,
      text: text.trim(),
      author,
      authorId: req.user.id,
    })

    const commentCount = await Comment.countDocuments({ postId: post._id })

    res.status(201).json({
      comment: {
        id: comment._id.toString(),
        text: comment.text,
        author: comment.author,
        at: comment.createdAt,
        time: formatTime(comment.createdAt),
      },
      commentCount,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '댓글 등록에 실패했습니다.' })
  }
})

// 오늘의 질문 의견
router.get('/opinions', async (_req, res) => {
  try {
    const opinions = await Opinion.find().sort({ createdAt: -1 }).limit(50).lean()
    res.json({
      opinions: opinions.map((o) => ({
        id: o._id.toString(),
        text: o.text,
        author: o.author,
        at: o.createdAt,
      })),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '의견을 불러오지 못했습니다.' })
  }
})

router.post('/opinions', requireAuth, async (req, res) => {
  try {
    const { text, nickname } = req.body
    if (!text?.trim()) {
      return res.status(400).json({ message: '의견을 입력해 주세요.' })
    }

    const author = (nickname || req.user.username || '익명').trim()
    const opinion = await Opinion.create({
      text: text.trim(),
      author,
      authorId: req.user.id,
    })

    res.status(201).json({
      opinion: {
        id: opinion._id.toString(),
        text: opinion.text,
        author: opinion.author,
        at: opinion.createdAt,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '의견 등록에 실패했습니다.' })
  }
})

module.exports = router
