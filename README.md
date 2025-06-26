# YouTube Vibe Analyzer

AI 기반 유튜브 영상 분석 및 트렌드 모니터링 서비스

## 🎯 프로젝트 개요

YouTube Vibe Analyzer는 AI를 활용하여 유튜브 영상의 내용을 자동으로 요약하고, 댓글을 분석하여 감정 분포와 주요 키워드를 시각화해주는 웹 애플리케이션입니다. 또한 AI 관련 트렌드 키워드를 모니터링하고 관련 인기 영상을 추천해줍니다.

### 주요 기능

- 🔥 **트렌드 모니터링**: AI 관련 실시간 인기 키워드 추적
- 📺 **영상 요약**: AI 기반 자동 영상 내용 요약
- 💬 **댓글 분석**: OpenAI를 활용한 정교한 감정 분석
- 📊 **마케팅 리포트**: 마케터를 위한 상세 분석 리포트
- 🌐 **다국어 지원**: 자동 한국어 번역 기능
- 📱 **반응형 UI**: 모바일/데스크탑 최적화

## 🚀 배포하기

### Vercel로 원클릭 배포

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/vibe_youtube3)

### 수동 배포 단계

1. **GitHub에 코드 업로드**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/vibe_youtube3.git
git push -u origin main
```

2. **Vercel 계정 생성 및 연결**
   - [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
   - "New Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **환경 변수 설정**
   - Vercel 프로젝트 설정에서 "Environment Variables" 섹션으로 이동
   - 다음 환경 변수들을 추가:
   ```
   YOUTUBE_API_KEY=your_youtube_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **배포 완료**
   - 자동으로 빌드 및 배포 시작
   - 배포 완료 후 제공되는 URL로 접속 가능

### API 키 발급 방법

#### YouTube Data API v3 키
1. [Google Cloud Console](https://console.developers.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리"에서 "YouTube Data API v3" 검색 및 활성화
4. "사용자 인증 정보" > "사용자 인증 정보 만들기" > "API 키" 선택
5. 생성된 API 키를 복사

#### OpenAI API 키
1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. 계정 생성 또는 로그인
3. "Create new secret key" 클릭
4. 생성된 API 키를 복사 (한 번만 표시됨)

## 🛠️ 로컬 개발 환경 설정

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd vibe_youtube3
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 API 키를 추가하세요:

```env
# YouTube Data API v3 키 (필수)
YOUTUBE_API_KEY=your_youtube_api_key_here

# OpenAI API 키 (필수)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 브라우저에서 확인
```
http://localhost:3000
```

## 🎨 기능 소개

### 🔥 트렌드 모니터링
- AI 관련 실시간 인기 키워드 표시
- 키워드별 관련 인기 영상 검색
- 최근 6개월 이내, 1만회 이상 조회수 필터링

### 📊 기본 분석
- AI 기반 영상 요약
- 댓글 감정 분석 (긍정/중립/부정)
- 대표 댓글 추출 (감정별 3개씩)
- 주요 키워드 추출

### 📈 마케팅 리포트
- 핵심 지표 대시보드
- 감정 분석 요약
- 키워드 분석
- 실행 가능한 마케팅 추천사항

## 📁 프로젝트 구조

```
vibe_youtube3/
├── app/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── TrendMonitor.tsx    # 트렌드 모니터링
│   │   ├── VideoSummary.tsx    # 영상 요약
│   │   ├── CommentAnalysis.tsx # 댓글 분석
│   │   ├── MarketingReport.tsx # 마케팅 리포트
│   │   └── ...
│   ├── api/
│   │   ├── analyze/         # 영상 분석 API
│   │   └── trends/          # 트렌드 API
│   │       ├── keywords/    # 키워드 트렌드
│   │       └── videos/      # 트렌드 영상
│   └── ...
├── env.example              # 환경 변수 예제
└── ...
```

## 🔧 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: OpenAI GPT API
- **APIs**: YouTube Data API v3
- **Charts**: Chart.js, React Chart.js 2
- **Deployment**: Vercel

## 📊 API 엔드포인트

### POST /api/analyze
유튜브 영상 분석을 수행합니다.

### GET /api/trends/keywords
AI 관련 트렌드 키워드를 가져옵니다.

### GET /api/trends/videos?keyword={keyword}
특정 키워드 관련 인기 영상을 검색합니다.

## 🔮 향후 개선사항

- 실시간 트렌드 업데이트
- 사용자 맞춤 키워드 추가
- 분석 결과 저장 및 히스토리
- 더 다양한 소셜 미디어 플랫폼 지원
- 고급 분석 기능 (토픽 모델링, 네트워크 분석)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License.

## 📞 문의

프로젝트에 대한 문의사항이나 버그 리포트는 GitHub Issues를 통해 남겨주세요. 