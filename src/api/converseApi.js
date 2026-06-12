import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:5000')

export const converseWithAI = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/api/converse`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    })
    return response.data
  } catch (error) {
    console.error('converse API error', error)
    if (error.response) throw new Error(error.response.data?.message || '서버 에러')
    if (error.request) throw new Error('서버에 연결할 수 없습니다.')
    throw error
  }
}

/** 사용자별 저장된 상담 대화 목록(최신순) 조회 */
export const fetchConversationHistory = async (userId) => {
  if (!userId) return []
  const response = await axios.get(`${API_URL}/api/converse/history/${userId}`)
  return response.data.convos || []
}
