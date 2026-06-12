const mongoose = require('mongoose')

// 카톡 분석 1회의 결과를 날짜별로 저장하는 스키마 (MY분석 그래프용)
const AnalysisSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    // 썸 지수 (0~100): 관계의 전반적 점수
    ssamScore: { type: Number, default: 0 },
    // 긍정도 (0~100)
    positivity: { type: Number, default: 0 },
    // 감정 비율 (합계 100 기준)
    emotions: {
      happy: { type: Number, default: 0 }, // 행복
      flutter: { type: Number, default: 0 }, // 설렘
      indifferent: { type: Number, default: 0 }, // 무관심
      sad: { type: Number, default: 0 }, // 슬픔
    },
    // 한 줄 요약
    summary: { type: String, default: '' },
    // 즐겨찾기 여부
    favorite: { type: Boolean, default: false },
    metadata: { type: Object },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Analysis', AnalysisSchema)
