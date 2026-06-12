import axios from 'axios'
import { getCurrentUserId } from './communityApi.js'

// 개발 환경에서는 프록시 사용, 프로덕션에서는 실제 URL 사용
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:5000')

/**
 * 카톡/상황 분석을 OpenAI를 통해 수행
 */
export const analyzeRelationship = async (analysisData) => {
  try {
    console.log('분석 요청 시작:', analysisData)

    // 로그인 사용자라면 userId를 함께 보내 날짜별로 DB에 저장
    const payload = { ...analysisData, userId: getCurrentUserId() }

    const response = await axios.post(`${API_URL}/api/analyze`, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60초 타임아웃 (GPT 응답이 오래 걸릴 수 있음)
    })
    
    console.log('분석 응답 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('분석 API 호출 실패:', error)
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('분석 시간이 초과했습니다. 서버가 응답하지 않고 있습니다.')
    }
    
    if (error.response) {
      // 서버에서 응답을 받았지만 에러 상태
      throw new Error(error.response.data?.message || `서버 에러 (${error.response.status})`)
    } else if (error.request) {
      // 요청을 보냈지만 응답을 받지 못함
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.')
    } else {
      throw error
    }
  }
}

/**
 * MY분석: 사용자의 분석 기록을 날짜별(최신순)로 조회
 */
export const fetchAnalysisHistory = async (userId) => {
  const id = userId || getCurrentUserId()
  if (!id) return []
  const response = await axios.get(`${API_URL}/api/analysis/history/${id}`)
  return response.data.records || []
}

/**
 * 분석 기록 즐겨찾기 토글
 */
export const toggleAnalysisFavorite = async (id) => {
  const response = await axios.patch(`${API_URL}/api/analysis/${id}/favorite`)
  return response.data
}

/**
 * 분석 기록 삭제
 */
export const deleteAnalysisRecord = async (id) => {
  const response = await axios.delete(`${API_URL}/api/analysis/${id}`)
  return response.data
}
