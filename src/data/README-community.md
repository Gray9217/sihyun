# 커뮤니티 콘텐츠 편집하기

`communityContent.json`을 수정한 뒤 개발 서버를 다시 켜면(Vite) 변경이 반영됩니다.

## `posts` (게시글 목록)

배열 안에 객체를 추가합니다. 예:

```json
{
  "id": "my-post-1",
  "emoji": "💬",
  "title": "글 제목",
  "excerpt": "목록에 보일 한두 줄 요약",
  "category": "썸 이야기",
  "author": "보여줄 닉네임",
  "initial": "아",
  "time": "3시간 전",
  "likes": 12,
  "comments": 4
}
```

- **category**는 반드시 다음 중 하나: `썸 이야기`, `연애 고민`, `대화 분석`, `이별`
- **emoji**는 없어도 됩니다 (`""` 또는 생략)

## `hotPosts` (실시간 인기 글 사이드바)

```json
{ "rank": 1, "title": "글 제목", "likes": 100 }
```

## `todayQuestion`

- **text**: 오늘의 질문 문장
- **baseParticipantCount**: 숫자만 적으면 됩니다. (사용자가 남긴 의견 수는 앱이 더해 표시)

## `tags`

`"#썸"` 형태의 문자열 배열입니다.

---

**앱에서 「글쓰기」로 쓴 글**은 브라우저 `localStorage`에만 저장되며, 이 JSON 파일과 합쳐져 맨 위에 보입니다.
