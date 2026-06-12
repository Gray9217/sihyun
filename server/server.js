const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcrypt')
const path = require('path')
const OpenAI = require('openai')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const User = require('./models/User')
const communityRoutes = require('./routes/community')
const kakaoAuthRoutes = require('./routes/kakaoAuth')
const { signToken } = require('./middleware/auth')
const { resolveRole, syncUserRole } = require('./utils/admin')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const Conversation = require('./models/Conversation')
const Analysis = require('./models/Analysis')
const Tesseract = require('tesseract.js')

const app = express()

app.use(cors())
// 이미지 포함 요청을 처리하기 위해 limit 증가
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

if (!process.env.MONGO_URI) {
  console.log('❌ MONGO_URI가 undefined입니다. .env 확인하세요')
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB 연결 성공'))
    .catch((err) => {
      console.log('❌ MongoDB 연결 실패')
      console.log(err)
    })
}

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: '닉네임, 이메일, 비밀번호를 모두 입력해 주세요.' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: '비밀번호는 8자 이상이어야 합니다.' })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: '이미 가입된 이메일입니다.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
      username: username.trim(),
      email: email.trim(),
      password: hashedPassword,
      role: resolveRole(email),
    })
    await newUser.save()

    res.status(201).json({ message: '회원가입 성공' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '서버 오류' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: '이메일이 존재하지 않습니다.' })
    }

    if (!user.password) {
      return res.status(400).json({ message: '카카오 로그인으로 가입한 계정입니다. 카카오로 로그인해주세요.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 틀렸습니다.' })
    }

    await syncUserRole(user)

    const token = signToken(user)

    res.status(200).json({
      message: '로그인 성공',
      username: user.username,
      token,
      userId: user._id.toString(),
      role: user.role || 'user',
      provider: user.provider || 'local',
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: '서버 오류' })
  }
})

// 📱 카톡 분석 엔드포인트 (텍스트 + 이미지 모두 지원)
// 분석 결과 텍스트를 바탕으로 수치 점수(썸 지수/긍정도/감정 비율)를 추출
async function extractAnalysisScores(analysisText, messageContent) {
  const fallback = {
    ssamScore: 60,
    positivity: 60,
    emotions: { happy: 40, flutter: 30, indifferent: 20, sad: 10 },
    summary: '',
  }
  try {
    const scoringPrompt = `다음은 연애/관계 분석 결과 텍스트입니다. 이 분석을 바탕으로 아래 JSON 형식으로만 응답하세요. 설명 없이 JSON만 출력합니다.
{
  "ssamScore": 0~100 사이 정수 (두 사람의 썸/관계 지수),
  "positivity": 0~100 사이 정수 (대화의 긍정도),
  "emotions": { "happy": 행복 비율, "flutter": 설렘 비율, "indifferent": 무관심 비율, "sad": 슬픔 비율 },
  "summary": "한 줄 요약 (40자 이내)"
}
emotions의 네 값 합계는 반드시 100이 되도록 하세요.

분석 결과:
${analysisText}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: scoringPrompt }],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const parsed = JSON.parse(completion.choices[0].message.content)
    const e = parsed.emotions || {}
    return {
      ssamScore: clampScore(parsed.ssamScore, fallback.ssamScore),
      positivity: clampScore(parsed.positivity, fallback.positivity),
      emotions: {
        happy: clampScore(e.happy, fallback.emotions.happy),
        flutter: clampScore(e.flutter, fallback.emotions.flutter),
        indifferent: clampScore(e.indifferent, fallback.emotions.indifferent),
        sad: clampScore(e.sad, fallback.emotions.sad),
      },
      summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 60) : '',
    }
  } catch (err) {
    console.error('점수 추출 실패 (기본값 사용):', err.message)
    return fallback
  }
}

function clampScore(value, fallback) {
  const n = Number(value)
  if (Number.isNaN(n)) return fallback
  return Math.max(0, Math.min(100, Math.round(n)))
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { myGender, otherGender, relationship, storyType, storyText, test, chatImages, userId } = req.body

    const hasText = storyText && storyText.trim().length > 0
    const hasImages = Array.isArray(chatImages) && chatImages.length > 0

    if (!hasText && !hasImages) {
      return res.status(400).json({ message: '상황 설명을 입력하거나 이미지를 첨부해주세요.' })
    }

    // OpenAI에 전달할 메시지 구성
    const systemPrompt = `당신은 전문 심리상담사이자 연애 전문가입니다. 사용자의 관계 상황을 분석하고 실질적인 조언을 제공합니다.

**중요한 지시사항:**
- 카카오톡 스크린샷의 텍스트 내용과 대화 패턴만 분석하세요
- 사람의 얼굴이나 프로필 사진은 무시하고 대화 내용에만 집중하세요
- 대화 메시지의 내용, 톤, 답장 시간 등의 패턴을 분석하세요

사용자 정보:
- 내 성별: ${myGender}
- 상대방 성별: ${otherGender}
- 관계 단계: ${relationship}
- 참고 테스트: ${test}

  분석 시 다음을 고려하세요:
1. 감정 분석: 대화 속 감정 흐름과 감정 온도
2. 관심도 분석: 상대방의 관심도 수준 파악
3. 패턴 분석: 답장 패턴과 대화 방식
4. 성별/관계 특성: 두 사람의 성별과 관계 단계에 맞는 해석
5. 구체적 조언: 현 상황에서 해야 할 행동 및 주의사항

  응답 형식:
## 📊 감정 분석
[감정 분석 결과]

## 💭 관심도 분석
[관심도 분석]

## ⏱️ 패턴 분석
[패턴 분석]

## 🎯 종합 평가
[종합 평가]

## 💡 추천 액션
[구체적인 조언 (3-5개)]

## 💬 보낼 답장 (맞춤 조언)
- 상대에게 바로 보낼 수 있는 예시 답장 1~3개(톤별: 친근/중립/단호), 각 예시 앞에 짧은 사용 상황 설명을 덧붙여 주세요.
- 각 예시 답장 아래에 왜 그 답장이 적절한지 한 문장으로 설명해주세요.
`

    // 메시지 콘텐츠 구성
    const messageContent = []

    // 텍스트 추가
    if (hasText) {
      messageContent.push({
        type: 'text',
        text: `다음 상황을 분석해주세요:\n\n${storyText}`
      })
    }

    // 이미지 추가
    if (hasImages) {
      console.log(`📷 이미지 ${chatImages.length}장 처리 중...`)
      for (let i = 0; i < chatImages.length; i++) {
        const imageData = chatImages[i]
        if (!imageData.data) {
          console.error(`❌ 이미지 ${i + 1}: Base64 데이터 없음`)
          continue
        }
        const base64Url = `data:${imageData.mediaType};base64,${imageData.data}`
        messageContent.push({
          type: 'image_url',
          image_url: {
            url: base64Url
          }
        })
        console.log(`✅ 이미지 ${i + 1} 추가 (${(imageData.data.length / 1024).toFixed(2)}KB)`)
      }
      
      if (hasText) {
        messageContent.push({
          type: 'text',
          text: '위의 사진과 상황 설명을 종합하여 분석해주세요.'
        })
      } else {
        messageContent.push({
          type: 'text',
          text: '위의 카카오톡 사진을 분석하여 두 사람의 관계를 평가해주세요.'
        })
      }
    }

    console.log(`🚀 OpenAI API 호출 시작 - 모델: gpt-4o, 메시지 개수: ${messageContent.length}`)

    // OpenAI API 호출 (Vision 모델 사용)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messageContent }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    console.log('✅ OpenAI 분석 완료')

    const analysis = completion.choices[0].message.content

    // 수치 점수 추출 (썸 지수, 긍정도, 감정 비율)
    const scores = await extractAnalysisScores(analysis, messageContent)

    const metadata = {
      myGender,
      otherGender,
      relationship,
      storyType,
      test,
      hasText,
      hasImages,
    }

    // 로그인한 사용자라면 분석 결과를 날짜별로 DB에 저장 (MY분석 그래프용)
    let savedId = null
    if (userId) {
      try {
        const saved = await Analysis.create({
          userId,
          ssamScore: scores.ssamScore,
          positivity: scores.positivity,
          emotions: scores.emotions,
          summary: scores.summary,
          metadata,
        })
        savedId = saved._id.toString()
        console.log('💾 분석 기록 저장 완료:', savedId)
      } catch (saveErr) {
        console.error('분석 기록 저장 실패:', saveErr.message)
      }
    }

    res.status(200).json({
      success: true,
      analysis,
      scores,
      analysisId: savedId,
      metadata,
    })
  } catch (error) {
    console.error('분석 실패:', error.message)
    console.error('에러 상세:', error)
    
    // OpenAI API 에러 처리
    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: `OpenAI API 에러 (${error.status}): ${error.message}`
      })
    }
    
    res.status(500).json({
      success: false,
      message: error.message || '분석 중 오류가 발생했습니다.'
    })
  }
})

// 대화형 상담용 엔드포인트 (클라이언트가 대화 히스토리를 전달하면 OpenAI에 전달하여 응답 반환)
app.post('/api/converse', async (req, res) => {
  try {
    const { messages, myGender, otherGender, relationship, test, chatImages, userId, conversationId } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'messages 배열을 전달하세요.' })
    }

    const systemPrompt = `당신은 전문 심리상담사이자 연애 전문가입니다. 사용자의 대화를 바탕으로 공감하면서도 실질적인 조언을 제공하세요. 불필요한 반복을 피하고, 요청에 따라 친절한 예시 답장과 간단한 이유를 제시하세요.\n\n사용자 정보:\n- 내 성별: ${myGender || '미상'}\n- 상대 성별: ${otherGender || '미상'}\n- 관계 단계: ${relationship || '미상'}\n- 참고 테스트: ${test || '없음'}`

    console.log('🚀 /api/converse 호출 - 메시지 개수:', messages.length)
    // Build message list including system prompt
    const msgsForOpenAI = [ { role: 'system', content: systemPrompt }, ...messages ]

    // If images were attached, convert to image messages and run OCR to extract text
    if (Array.isArray(chatImages) && chatImages.length > 0) {
      const ocrResults = []
      for (let i = 0; i < chatImages.length; i++) {
        const img = chatImages[i]
        if (!img.data) continue
        const base64Url = `data:${img.mediaType};base64,${img.data}`
        msgsForOpenAI.push({ type: 'image_url', image_url: { url: base64Url } })

        // Try OCR (best-effort)
        try {
          const buffer = Buffer.from(img.data, 'base64')
          const { data: ocrData } = await Tesseract.recognize(buffer)
          if (ocrData && ocrData.text) {
            ocrResults.push(`Image ${i + 1} OCR:\n${ocrData.text.trim()}`)
          }
        } catch (ocrErr) {
          console.error('OCR 실패 (무시):', ocrErr.message || ocrErr)
        }
      }

      if (ocrResults.length > 0) {
        msgsForOpenAI.push({ role: 'user', content: `이미지에서 추출한 텍스트 요약:\n${ocrResults.join('\n\n')}` })
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: msgsForOpenAI,
      temperature: 0.75,
      max_tokens: 1200
    })

    const reply = completion.choices[0].message.content

    // 세션 단위로 저장: conversationId가 있으면 해당 대화에 이어붙이고, 없으면 새로 생성
    let savedConversationId = conversationId || null
    try {
      const convoMessages = messages.map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      }))
      convoMessages.push({ role: 'assistant', content: reply })
      const metadata = { myGender, otherGender, relationship, test }

      let convo = null
      if (conversationId) {
        convo = await Conversation.findByIdAndUpdate(
          conversationId,
          { messages: convoMessages, metadata, userId: userId || null },
          { new: true }
        )
      }
      if (!convo) {
        convo = await Conversation.create({ userId: userId || null, metadata, messages: convoMessages })
      }
      savedConversationId = convo._id.toString()
    } catch (saveErr) {
      console.error('Conversation 저장 실패:', saveErr)
    }

    res.status(200).json({ success: true, reply, conversationId: savedConversationId })
  } catch (error) {
    console.error('/api/converse 에러:', error)
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message })
    }
    res.status(500).json({ success: false, message: error.message || '대화 중 오류가 발생했습니다.' })
  }
})

// 사용자별 대화 내역 조회 (최신 순)
app.get('/api/converse/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId
    const convos = await Conversation.find({ userId }).sort({ updatedAt: -1 }).limit(50)
    res.status(200).json({ success: true, convos })
  } catch (err) {
    console.error('history 조회 실패', err)
    res.status(500).json({ success: false, message: '대화 내역을 불러오는 데 실패했습니다.' })
  }
})

// 📈 MY분석: 사용자별 분석 기록 (날짜별, 최신순)
app.get('/api/analysis/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const records = await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(200)
    res.status(200).json({ success: true, records })
  } catch (err) {
    console.error('분석 기록 조회 실패', err)
    res.status(500).json({ success: false, message: '분석 기록을 불러오지 못했습니다.' })
  }
})

// 즐겨찾기 토글
app.patch('/api/analysis/:id/favorite', async (req, res) => {
  try {
    const record = await Analysis.findById(req.params.id)
    if (!record) return res.status(404).json({ success: false, message: '기록을 찾을 수 없습니다.' })
    record.favorite = !record.favorite
    await record.save()
    res.status(200).json({ success: true, favorite: record.favorite })
  } catch (err) {
    console.error('즐겨찾기 토글 실패', err)
    res.status(500).json({ success: false, message: '즐겨찾기 변경에 실패했습니다.' })
  }
})

// 분석 기록 삭제
app.delete('/api/analysis/:id', async (req, res) => {
  try {
    await Analysis.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true })
  } catch (err) {
    console.error('분석 기록 삭제 실패', err)
    res.status(500).json({ success: false, message: '삭제에 실패했습니다.' })
  }
})

app.use('/auth', kakaoAuthRoutes)
app.use('/api/community', communityRoutes)

app.listen(5000, () => {
  console.log('🚀 서버 실행 완료 (port 5000)')
})
