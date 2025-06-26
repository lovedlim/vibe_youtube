import { NextRequest, NextResponse } from 'next/server'

interface Video {
  id: string
  title: string
  thumbnail: string
  views: string
  duration: string
  channelTitle: string
  publishedAt: string
}

// 영상 지속시간 포맷팅
function formatDuration(duration: string): string {
  try {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return '알 수 없음'
    
    const hours = parseInt(match[1]?.slice(0, -1) || '0')
    const minutes = parseInt(match[2]?.slice(0, -1) || '0')
    const seconds = parseInt(match[3]?.slice(0, -1) || '0')
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
  } catch {
    return '알 수 없음'
  }
}

// 조회수 포맷팅
function formatViewCount(count: number): string {
  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(1)}억회`
  } else if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}만회`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}천회`
  } else {
    return `${count}회`
  }
}

// 날짜 포맷팅
function formatPublishedDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1일 전'
  if (diffDays < 7) return `${diffDays}일 전`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`
  return `${Math.floor(diffDays / 365)}년 전`
}

// YouTube Search API로 AI 관련 인기 영상 검색
async function searchYouTubeVideos(keyword: string) {
  console.log('=== searchYouTubeVideos 함수 시작 ===')
  console.log('입력 키워드:', keyword)
  
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
  console.log('YouTube API 키 존재 여부:', !!YOUTUBE_API_KEY)
  
  if (!YOUTUBE_API_KEY) {
    console.log('YouTube API 키가 없음, 모의 데이터 사용')
    const mockData = generateMockVideos(keyword)
    console.log('모의 데이터 생성 완료:', mockData.length, '개')
    return mockData
  }

  console.log('YouTube API로 검색 시작:', `"${keyword}"`)
  
  // 키워드 정리
  const cleanKeyword = keyword.replace(/^#/, '').trim()
  const searchKeyword = cleanKeyword || keyword
  console.log('정리된 키워드:', `"${searchKeyword}"`)

  // 여러 검색 전략 시도
  const searchStrategies = [
    {
      name: '기본 검색',
      params: {
        part: 'snippet',
        q: searchKeyword,
        type: 'video',
        order: 'relevance',
        maxResults: 12,
        key: YOUTUBE_API_KEY
      }
    },
    {
      name: '인기순 검색',
      params: {
        part: 'snippet',
        q: searchKeyword,
        type: 'video',
        order: 'viewCount',
        maxResults: 12,
        key: YOUTUBE_API_KEY
      }
    },
    {
      name: '최신순 검색',
      params: {
        part: 'snippet',
        q: searchKeyword,
        type: 'video',
        order: 'date',
        maxResults: 12,
        key: YOUTUBE_API_KEY
      }
    },
    {
      name: '한국 지역 검색',
      params: {
        part: 'snippet',
        q: searchKeyword,
        type: 'video',
        order: 'relevance',
        regionCode: 'KR',
        maxResults: 12,
        key: YOUTUBE_API_KEY
      }
    }
  ]

  // 각 전략을 순차적으로 시도
  for (const strategy of searchStrategies) {
    try {
      console.log(`${strategy.name} 시도 중...`)
      
      const searchParams = new URLSearchParams()
      Object.entries(strategy.params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchParams}`
      const response = await fetch(searchUrl)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log(`${strategy.name} API 오류:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        // 할당량 초과 오류 확인
        if (response.status === 403 && errorText.includes('quotaExceeded')) {
          console.log('⚠️ YouTube API 할당량 초과 - 모의 데이터로 대체')
          break // 다른 전략도 동일한 오류가 발생할 것이므로 중단
        }
        
        continue // 다른 전략 시도
      }

      const data = await response.json()
      console.log(`${strategy.name} 성공:`, data.items?.length || 0, '개 결과')

      if (data.items && data.items.length > 0) {
        // 비디오 상세 정보 가져오기
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',')
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        
        try {
          const detailsResponse = await fetch(detailsUrl)
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json()
            const processedVideos = detailsData.items.map((video: any) => ({
              id: video.id,
              title: video.snippet.title,
              description: video.snippet.description,
              thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
              channelTitle: video.snippet.channelTitle,
              publishedAt: video.snippet.publishedAt,
              viewCount: parseInt(video.statistics?.viewCount || '0'),
              likeCount: parseInt(video.statistics?.likeCount || '0'),
              url: `https://www.youtube.com/watch?v=${video.id}`
            }))
            
            console.log(`${strategy.name} 완료:`, processedVideos.length, '개 영상 처리됨')
            return processedVideos
          }
        } catch (detailsError) {
          console.log('상세 정보 가져오기 실패, 기본 정보만 사용:', detailsError)
          // 기본 정보만으로 비디오 데이터 구성
          const basicVideos = data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt,
            viewCount: 0,
            likeCount: 0,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`
          }))
          
          return basicVideos
        }
      }
      
    } catch (error) {
      console.log(`${strategy.name} 오류:`, error)
      continue
    }
  }

  // 모든 전략 실패 시 모의 데이터 반환
  console.log('📊 YouTube API 사용 불가 (할당량 초과 또는 오류) - 데모 데이터로 대체')
  console.log('💡 실제 데이터를 보려면 내일 다시 시도하거나 Google Cloud Console에서 할당량을 증가시키세요.')
  const mockData = generateMockVideos(keyword)
  console.log('모의 데이터 생성:', mockData.length, '개')
  return mockData
}

// 모의 영상 데이터 생성
function generateMockVideos(keyword: string) {
  console.log(`모의 데이터 생성: ${keyword}`)
  
  // 키워드별 특화된 모의 데이터
  const mockTemplates = [
    {
      id: 'mock1',
      title: `${keyword} 완벽 가이드 - 초보자도 이해할 수 있는 쉬운 설명`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '15.2만회',
      duration: '12:34',
      channelTitle: '테크 트렌드',
      publishedAt: '1일 전'
    },
    {
      id: 'mock2',
      title: `${keyword} 최신 트렌드 분석 2024 - 지금 꼭 알아야 할 것들`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '8.7만회',
      duration: '8:45',
      channelTitle: '인기 유튜버',
      publishedAt: '3일 전'
    },
    {
      id: 'mock3',
      title: `${keyword}에 대해 알아야 할 모든 것 - 전문가 인터뷰`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '23.1만회',
      duration: '15:22',
      channelTitle: '전문가 채널',
      publishedAt: '5일 전'
    },
    {
      id: 'mock4',
      title: `${keyword} 실시간 리뷰 및 반응 - 솔직한 후기`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '5.4만회',
      duration: '6:18',
      channelTitle: '리뷰어',
      publishedAt: '2일 전'
    },
    {
      id: 'mock5',
      title: `${keyword} 2024년 최신 업데이트 소식 - 놓치면 안 되는 정보`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '12.8만회',
      duration: '9:42',
      channelTitle: '뉴스 채널',
      publishedAt: '4일 전'
    },
    {
      id: 'mock6',
      title: `${keyword} 실전 활용법 - 지금 바로 시작하는 방법`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '7.3만회',
      duration: '11:15',
      channelTitle: '실용 채널',
      publishedAt: '6일 전'
    },
    {
      id: 'mock7',
      title: `${keyword} 입문자를 위한 기초 강의 - 무료 강의`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '31.5만회',
      duration: '25:30',
      channelTitle: '교육 채널',
      publishedAt: '1주 전'
    },
    {
      id: 'mock8',
      title: `${keyword} 성공 사례 분석 - 실제 적용 후기`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '9.2만회',
      duration: '13:45',
      channelTitle: '성공스토리',
      publishedAt: '3일 전'
    },
    {
      id: 'mock9',
      title: `${keyword} vs 기존 방식 비교 - 어떤 게 더 좋을까?`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '6.8만회',
      duration: '7:20',
      channelTitle: '비교 분석',
      publishedAt: '5일 전'
    },
    {
      id: 'mock10',
      title: `${keyword} 미래 전망 - 전문가들의 예측`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '18.4만회',
      duration: '16:50',
      channelTitle: '미래 연구소',
      publishedAt: '2일 전'
    },
    {
      id: 'mock11',
      title: `${keyword} 문제점과 해결책 - 현실적인 접근`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '4.7만회',
      duration: '10:15',
      channelTitle: '문제 해결사',
      publishedAt: '4일 전'
    },
    {
      id: 'mock12',
      title: `${keyword} 최고의 도구들 - 추천 리스트 TOP 10`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '14.6만회',
      duration: '19:30',
      channelTitle: '도구 리뷰',
      publishedAt: '1주 전'
    }
  ]
  
  return mockTemplates
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== 트렌드 영상 API 호출 시작 ===')
    
    const { keyword } = await request.json()
    console.log('받은 키워드:', keyword)
    
    if (!keyword) {
      console.log('키워드가 없어서 400 에러 반환')
      return NextResponse.json(
        { error: '검색 키워드가 필요합니다.' },
        { status: 400 }
      )
    }
    
    console.log(`트렌드 영상 검색: ${keyword}`)
    console.log('searchYouTubeVideos 함수 호출 시작')
    
    const videos = await searchYouTubeVideos(keyword)
    
    console.log('searchYouTubeVideos 함수 호출 완료, 결과:', videos.length, '개')
    console.log('=== 트렌드 영상 API 호출 완료 ===')
    
    return NextResponse.json({
      videos,
      keyword,
      timestamp: new Date().toISOString(),
      count: videos.length
    })
    
  } catch (error) {
    console.error('트렌드 영상 검색 API 오류:', error)
    return NextResponse.json(
      { error: '영상 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 