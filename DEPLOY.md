# 🚀 배포 가이드

YouTube Vibe Analyzer를 Vercel에 배포하는 방법을 설명합니다.

## 📋 배포 전 준비사항

### 1. API 키 발급

#### YouTube Data API v3 키
1. [Google Cloud Console](https://console.developers.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리"에서 "YouTube Data API v3" 검색 및 활성화
4. "사용자 인증 정보" > "사용자 인증 정보 만들기" > "API 키" 선택
5. 생성된 API 키를 복사하여 저장

#### OpenAI API 키
1. [OpenAI Platform](https://platform.openai.com/api-keys) 접속
2. 계정 생성 또는 로그인
3. "Create new secret key" 클릭
4. 생성된 API 키를 복사하여 저장 (한 번만 표시됨)

### 2. GitHub 저장소 준비

```bash
# 프로젝트 초기화 (아직 git이 초기화되지 않은 경우)
git init

# 모든 파일 추가
git add .

# 첫 번째 커밋
git commit -m "Initial commit: YouTube Vibe Analyzer"

# 메인 브랜치 설정
git branch -M main

# GitHub 저장소와 연결 (본인의 저장소 URL로 변경)
git remote add origin https://github.com/YOUR_USERNAME/vibe_youtube3.git

# GitHub에 푸시
git push -u origin main
```

## 🔧 Vercel 배포 단계

### 방법 1: 원클릭 배포 (추천)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/vibe_youtube3)

1. 위 버튼 클릭
2. GitHub 계정으로 Vercel에 로그인
3. 저장소 이름 확인 후 "Create" 클릭
4. 환경 변수 설정 (아래 참조)
5. "Deploy" 클릭

### 방법 2: 수동 배포

1. **Vercel 계정 생성**
   - [Vercel](https://vercel.com)에 GitHub 계정으로 로그인

2. **프로젝트 가져오기**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 선택
   - "Import" 클릭

3. **프로젝트 설정**
   - Framework Preset: Next.js (자동 감지)
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (기본값)
   - Output Directory: `.next` (기본값)

4. **환경 변수 설정** (중요!)
   - "Environment Variables" 섹션에서 다음 변수들을 추가:
   
   ```
   Name: YOUTUBE_API_KEY
   Value: your_youtube_api_key_here
   
   Name: OPENAI_API_KEY  
   Value: your_openai_api_key_here
   ```

5. **배포 시작**
   - "Deploy" 버튼 클릭
   - 빌드 및 배포 진행 상황 확인

## ✅ 배포 완료 후 확인사항

### 1. 기본 기능 테스트
- 트렌드 모니터링 탭이 정상 작동하는지 확인
- 샘플 YouTube URL로 분석 기능 테스트
- 마케팅 리포트 생성 확인

### 2. API 연동 확인
- 실제 YouTube 영상으로 분석 테스트
- OpenAI 기반 요약 및 감정 분석 확인
- 에러 로그 확인 (Vercel 대시보드 > Functions 탭)

### 3. 성능 확인
- 페이지 로딩 속도 확인
- 모바일 반응형 디자인 확인
- 다양한 브라우저에서 테스트

## 🔧 배포 후 관리

### 환경 변수 업데이트
1. Vercel 대시보드 > 프로젝트 선택
2. "Settings" > "Environment Variables"
3. 변수 수정 후 "Save"
4. 새로운 배포 트리거 (자동 재배포됨)

### 도메인 설정
1. Vercel 대시보드 > 프로젝트 선택
2. "Settings" > "Domains"
3. 커스텀 도메인 추가 또는 Vercel 도메인 사용

### 로그 모니터링
1. Vercel 대시보드 > 프로젝트 선택
2. "Functions" 탭에서 API 호출 로그 확인
3. "Analytics" 탭에서 사용량 통계 확인

## 🚨 문제 해결

### 빌드 실패 시
```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 오류 확인
npm run lint
```

### API 오류 시
- Vercel 함수 로그 확인
- 환경 변수 설정 재확인
- API 키 유효성 검증

### 성능 이슈 시
- Vercel Analytics 확인
- 함수 실행 시간 모니터링
- 메모리 사용량 확인

## 📊 사용량 및 비용

### Vercel 무료 플랜 제한
- 함수 실행 시간: 10초
- 대역폭: 100GB/월
- 빌드: 6,000분/월

### API 사용량
- YouTube Data API: 일일 10,000 쿼터 (무료)
- OpenAI API: 사용량에 따른 과금

## 🔄 업데이트 배포

코드 변경 후 자동 배포:
```bash
git add .
git commit -m "Update: 변경사항 설명"
git push origin main
```

Vercel이 자동으로 새 버전을 감지하고 배포합니다.

## 📞 지원

배포 관련 문제가 있으면:
- [Vercel 문서](https://vercel.com/docs) 참조
- [GitHub Issues](https://github.com/YOUR_USERNAME/vibe_youtube3/issues)에 문제 보고
- Vercel 커뮤니티 포럼 활용

---

🎉 배포 완료 후 생성된 URL을 통해 전 세계 어디서나 YouTube Vibe Analyzer를 사용할 수 있습니다! 