const express = require('express')
const User = require('../models/User')
const { signToken } = require('../middleware/auth')
const { resolveRole, syncUserRole } = require('../utils/admin')

const router = express.Router()

const KAKAO_AUTH_URL = 'https://kauth.kakao.com/oauth/authorize'
const KAKAO_TOKEN_URL = 'https://kauth.kakao.com/oauth/token'
const KAKAO_USER_URL = 'https://kapi.kakao.com/v2/user/me'
const KAKAO_LOGOUT_URL = 'https://kauth.kakao.com/oauth/logout'

function getConfig() {
  return {
    clientId: process.env.KAKAO_REST_API_KEY,
    redirectUri: process.env.KAKAO_REDIRECT_URI || 'http://localhost:5000/auth/kakao/callback',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    logoutRedirectUri:
      process.env.KAKAO_LOGOUT_REDIRECT_URI ||
      process.env.FRONTEND_URL ||
      'http://localhost:5173',
  }
}

function redirectWithError(res, frontendUrl, message) {
  const params = new URLSearchParams({ auth_error: message })
  res.redirect(`${frontendUrl}?${params}`)
}

router.get('/kakao', (req, res) => {
  const { clientId, redirectUri } = getConfig()
  if (!clientId) {
    return res.status(500).json({ message: '카카오 REST API 키가 설정되지 않았습니다.' })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    // 브라우저에 카카오 세션이 남아 있어도 매번 아이디·비밀번호 입력 요구
    prompt: 'login',
  })
  res.redirect(`${KAKAO_AUTH_URL}?${params}`)
})

// 카카오계정 세션까지 함께 로그아웃 (브라우저에 카카오 로그인 상태가 남지 않도록)
router.get('/kakao/logout', (req, res) => {
  const { clientId, logoutRedirectUri } = getConfig()
  if (!clientId) {
    return res.status(500).json({ message: '카카오 REST API 키가 설정되지 않았습니다.' })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    logout_redirect_uri: logoutRedirectUri,
  })
  res.redirect(`${KAKAO_LOGOUT_URL}?${params}`)
})

router.get('/kakao/callback', async (req, res) => {
  const { code, error } = req.query
  const { clientId, redirectUri, frontendUrl } = getConfig()

  if (error || !code) {
    return redirectWithError(res, frontendUrl, '카카오 로그인이 취소되었습니다.')
  }

  if (!clientId) {
    return redirectWithError(res, frontendUrl, '카카오 REST API 키가 설정되지 않았습니다.')
  }

  try {
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
    })
    if (process.env.KAKAO_CLIENT_SECRET) {
      tokenBody.set('client_secret', process.env.KAKAO_CLIENT_SECRET)
    }

    const tokenRes = await fetch(KAKAO_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: tokenBody,
    })
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error('카카오 토큰 발급 실패:', tokenData)
      return redirectWithError(res, frontendUrl, '카카오 토큰 발급에 실패했습니다.')
    }

    const userRes = await fetch(KAKAO_USER_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const kakaoUser = await userRes.json()

    const kakaoId = String(kakaoUser.id)
    const nickname =
      kakaoUser.kakao_account?.profile?.nickname ||
      kakaoUser.properties?.nickname ||
      `user_${kakaoId.slice(-6)}`
    const email = kakaoUser.kakao_account?.email || null
    const profileImage =
      kakaoUser.kakao_account?.profile?.profile_image_url ||
      kakaoUser.properties?.profile_image ||
      null

    let user = await User.findOne({ kakaoId })

    if (!user && email) {
      const existingByEmail = await User.findOne({ email })
      if (existingByEmail) {
        existingByEmail.kakaoId = kakaoId
        if (!existingByEmail.profileImage && profileImage) {
          existingByEmail.profileImage = profileImage
        }
        await existingByEmail.save()
        user = existingByEmail
      }
    }

    if (!user) {
      user = await User.create({
        username: nickname,
        email: email || `kakao_${kakaoId}@kakao.local`,
        password: null,
        provider: 'kakao',
        kakaoId,
        profileImage,
        role: resolveRole(email),
      })
    }

    await syncUserRole(user)

    const token = signToken(user)
    const params = new URLSearchParams({
      token,
      username: user.username,
      userId: user._id.toString(),
      role: user.role || 'user',
      provider: 'kakao',
    })
    res.redirect(`${frontendUrl}?${params}`)
  } catch (err) {
    console.error('카카오 로그인 콜백 오류:', err)
    redirectWithError(res, frontendUrl, '카카오 로그인 중 오류가 발생했습니다.')
  }
})

module.exports = router
