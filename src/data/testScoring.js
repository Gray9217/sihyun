const TRAITS = ['직진형', '신중형', '밀당형', '집착형']

export function calculateResultType(traits) {
  const counts = Object.fromEntries(TRAITS.map((t) => [t, 0]))
  traits.forEach((trait) => {
    if (counts[trait] !== undefined) counts[trait]++
  })
  return TRAITS.reduce((best, trait) => (counts[trait] > counts[best] ? trait : best), '신중형')
}

export function calculateLoveScore(traits, testTitle = '') {
  const positive = traits.filter((t) => t === '직진형' || t === '신중형').length
  const anxious = traits.filter((t) => t === '집착형').length
  const pushPull = traits.filter((t) => t === '밀당형').length
  const total = traits.length || 1

  let score = 52 + Math.round((positive / total) * 38) - Math.round((anxious / total) * 18) + Math.round((pushPull / total) * 6)

  if (testTitle.includes('썸') || testTitle.includes('관심') || testTitle.includes('속마음')) {
    score += 6
  }
  if (testTitle.includes('이별') || testTitle.includes('미련')) {
    score = Math.max(38, 88 - score)
  }
  if (testTitle.includes('집착')) {
    score -= 4
  }

  return Math.max(35, Math.min(97, score))
}
