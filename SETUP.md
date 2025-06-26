# 실제 YouTube 데이터 사용 설정 가이드

## 🔑 API 키 설정

### 1. YouTube Data API v3 키 발급

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리"로 이동
4. "YouTube Data API v3" 검색 후 활성화
5. "API 및 서비스" > "사용자 인증 정보"로 이동
6. "사용자 인증 정보 만들기" > "API 키" 선택
7. 생성된 API 키 복사

### 2. OpenAI API 키 발급 (선택사항 - 더 나은 요약을 위해)

1. [OpenAI Platform](https://platform.openai.com/)에 접속
2. 계정 생성 또는 로그인
3. "API Keys" 섹션에서 새 키 생성
4. 생성된 API 키 복사

### 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# YouTube Data API v3 키 (필수)
YOUTUBE_API_KEY=your_actual_youtube_api_key_here

# OpenAI API 키 (선택사항 - 더 나은 요약을 위해)
OPENAI_API_KEY=your_openai_api_key_here

# Next.js 환경
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 사용 방법

### API 키 없이 사용하기
- YouTube API 키가 없으면 모의 데이터를 사용합니다
- 기본적인 UI/UX 테스트가 가능합니다

### API 키와 함께 사용하기
- YouTube API 키가 있으면 실제 영상 데이터를 분석합니다
- 실제 댓글, 영상 정보, 자막을 가져옵니다
- OpenAI API 키가 있으면 더 정교한 요약을 생성합니다

## 📊 지원하는 기능

### ✅ 현재 지원
- 실제 YouTube 영상 메타데이터 (제목, 썸네일, 조회수, 길이)
- 실제 댓글 데이터 (최대 100개)
- 자막 추출 (한국어/영어)
- 감정 분석 (한국어 키워드 기반)
- 키워드 추출
- OpenAI 기반 요약 (API 키 있을 때)

### 🔄 폴백 동작
- API 키가 없거나 오류 발생시 모의 데이터 사용
- 자막이 없는 영상의 경우 기본 요약 제공
- 댓글이 비활성화된 영상의 경우 샘플 댓글 표시

## 🛠️ 고급 설정

### API 할당량 관리
- YouTube Data API는 일일 할당량이 있습니다 (기본 10,000 단위)
- 한 번의 분석당 약 3-4 단위 소모
- 할당량 초과시 다음날까지 대기 필요

### 자막 추출 제한사항
- 자막이 활성화된 영상만 가능
- 일부 영상은 자막 추출이 제한될 수 있습니다
- 자막이 없으면 기본 요약만 제공

### 댓글 분석 제한사항
- 댓글이 비활성화된 영상은 분석 불가
- 비공개 또는 연령 제한 영상은 접근 불가
- 최대 100개 댓글만 분석 (API 효율성을 위해)

## 🔧 개발자 설정

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

### API 테스트
```bash
# 실제 YouTube 영상으로 테스트
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## 🚨 주의사항

1. **API 키 보안**: 
   - `.env.local` 파일은 절대 Git에 커밋하지 마세요
   - 프로덕션에서는 환경변수로 안전하게 관리하세요

2. **YouTube 정책 준수**:
   - YouTube API 서비스 약관을 준수하세요
   - 과도한 요청은 피하세요

3. **비용 관리**:
   - OpenAI API는 사용량에 따라 과금됩니다
   - 개발시에는 요청 횟수를 제한하세요

## 🆘 문제 해결

### "자막을 찾을 수 없습니다" 오류
- 해당 영상에 자막이 없는 경우입니다
- 자막이 있는 다른 영상으로 테스트해보세요

### "YouTube API 호출 실패" 오류
- API 키가 올바른지 확인하세요
- YouTube Data API v3가 활성화되어 있는지 확인하세요
- 할당량이 남아있는지 확인하세요

### "올바른 YouTube URL이 아닙니다" 오류
- URL 형식을 확인하세요: 
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`

## 📈 향후 개선 계획

- 실시간 댓글 스트리밍
- 다국어 자막 지원
- BERT 기반 고급 감정 분석
- 영상 저장 및 히스토리 기능
- 분석 결과 내보내기 