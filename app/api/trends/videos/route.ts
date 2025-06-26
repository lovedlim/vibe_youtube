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
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
  
  if (!YOUTUBE_API_KEY) {
    console.log('YouTube API 키가 없음, 모의 데이터 사용')
    return generateMockVideos(keyword)
  }

  try {
    console.log(`YouTube API로 검색 시작: ${keyword}`)
    
    // 검색 키워드 최적화 - AI 관련이 아닌 키워드도 포함
    let enhancedKeyword = keyword
    const aiKeywords = ['AI', '인공지능', 'ChatGPT', 'GPT', '머신러닝', '딥러닝', '블록체인', '기술', '코딩', '프로그래밍']
    const isAIRelated = aiKeywords.some(ai => keyword.toLowerCase().includes(ai.toLowerCase()))
    
    if (isAIRelated) {
      enhancedKeyword = `${keyword} 기술 트렌드`
    }
    
    // 최근 1년 이내로 범위 확대 (6개월 → 1년)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const publishedAfter = oneYearAgo.toISOString()
    
    let allVideos: any[] = []
    
    // 1단계: 관련성 기준으로 검색 (relevance)
    console.log('1단계: 관련성 기준 검색')
    const relevanceResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(enhancedKeyword)}&type=video&order=relevance&regionCode=KR&publishedAfter=${publishedAfter}&maxResults=20&key=${YOUTUBE_API_KEY}`
    )
    
    if (relevanceResponse.ok) {
      const relevanceData = await relevanceResponse.json()
      console.log(`관련성 검색 결과: ${relevanceData.items?.length || 0}개`)
      if (relevanceData.items) {
        allVideos = [...allVideos, ...relevanceData.items]
      }
    } else {
      console.error('관련성 검색 실패:', relevanceResponse.status, relevanceResponse.statusText)
    }
    
    // 2단계: 인기순으로 검색 (viewCount)
    console.log('2단계: 인기순 검색')
    const popularResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(enhancedKeyword)}&type=video&order=viewCount&regionCode=KR&publishedAfter=${publishedAfter}&maxResults=15&key=${YOUTUBE_API_KEY}`
    )
    
    if (popularResponse.ok) {
      const popularData = await popularResponse.json()
      console.log(`인기순 검색 결과: ${popularData.items?.length || 0}개`)
      if (popularData.items) {
        const existingIds = new Set(allVideos.map(item => item.id.videoId))
        const newVideos = popularData.items.filter((item: any) => !existingIds.has(item.id.videoId))
        allVideos = [...allVideos, ...newVideos]
      }
    } else {
      console.error('인기순 검색 실패:', popularResponse.status, popularResponse.statusText)
    }
    
    // 3단계: 원래 키워드로만 검색 (fallback)
    if (allVideos.length < 10) {
      console.log('3단계: 원래 키워드로 fallback 검색')
      const fallbackResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=relevance&regionCode=KR&publishedAfter=${publishedAfter}&maxResults=20&key=${YOUTUBE_API_KEY}`
      )
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        console.log(`Fallback 검색 결과: ${fallbackData.items?.length || 0}개`)
        if (fallbackData.items) {
          const existingIds = new Set(allVideos.map(item => item.id.videoId))
          const newVideos = fallbackData.items.filter((item: any) => !existingIds.has(item.id.videoId))
          allVideos = [...allVideos, ...newVideos]
        }
      }
    }
    
    // 4단계: 더 넓은 범위로 검색 (2년)
    if (allVideos.length < 5) {
      console.log('4단계: 2년 범위로 확대 검색')
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      const extendedPublishedAfter = twoYearsAgo.toISOString()
      
      const extendedResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&regionCode=KR&publishedAfter=${extendedPublishedAfter}&maxResults=20&key=${YOUTUBE_API_KEY}`
      )
      
      if (extendedResponse.ok) {
        const extendedData = await extendedResponse.json()
        console.log(`확대 검색 결과: ${extendedData.items?.length || 0}개`)
        if (extendedData.items) {
          const existingIds = new Set(allVideos.map(item => item.id.videoId))
          const newVideos = extendedData.items.filter((item: any) => !existingIds.has(item.id.videoId))
          allVideos = [...allVideos, ...newVideos]
        }
      }
    }
    
    console.log(`총 검색된 영상 수: ${allVideos.length}개`)
    
    if (allVideos.length === 0) {
      console.log('검색 결과가 없어 모의 데이터 반환')
      return generateMockVideos(keyword)
    }
    
    // 영상 상세 정보 가져오기
    const videoIds = allVideos.slice(0, 30).map((item: any) => item.id.videoId).join(',')
    console.log(`상세 정보 요청할 영상 ID들: ${videoIds.substring(0, 100)}...`)
    
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )
    
    if (!detailsResponse.ok) {
      console.error('영상 상세 정보 요청 실패:', detailsResponse.status, detailsResponse.statusText)
      return generateMockVideos(keyword)
    }
    
    const detailsData = await detailsResponse.json()
    console.log(`상세 정보 받은 영상 수: ${detailsData.items?.length || 0}개`)
    
    // 데이터 결합 및 조회수 필터링 (1만회 → 1천회로 완화)
    const videos = allVideos.slice(0, 30).map((searchItem: any) => {
      const details = detailsData.items?.find((detail: any) => detail.id === searchItem.id.videoId)
      const viewCount = parseInt(details?.statistics?.viewCount || '0')
      
      return {
        id: searchItem.id.videoId,
        title: searchItem.snippet.title,
        thumbnail: searchItem.snippet.thumbnails.medium?.url || searchItem.snippet.thumbnails.default?.url,
        views: formatViewCount(viewCount),
        duration: formatDuration(details?.contentDetails?.duration || 'PT0S'),
        channelTitle: searchItem.snippet.channelTitle,
        publishedAt: formatPublishedDate(searchItem.snippet.publishedAt),
        rawViewCount: viewCount,
        rawPublishedAt: searchItem.snippet.publishedAt
      }
    })
    .filter((video: any) => {
      // 최소 조회수 필터링 완화 (1만회 → 1천회)
      return video.rawViewCount >= 1000
    })
    
    console.log(`필터링 후 영상 수: ${videos.length}개`)
    
    // 조회수와 최신성을 조합한 점수로 정렬
    const scoredVideos = videos.map((video: any) => {
      const daysSincePublished = Math.floor((Date.now() - new Date(video.rawPublishedAt).getTime()) / (1000 * 60 * 60 * 24))
      const viewScore = Math.log10(video.rawViewCount + 1) // 로그 스케일로 조회수 점수
      const recencyScore = Math.max(0, 365 - daysSincePublished) / 365 // 1년 이내일수록 높은 점수
      const totalScore = viewScore * 0.6 + recencyScore * 0.4 // 조회수 60%, 최신성 40%
      
      return {
        ...video,
        score: totalScore
      }
    })
    
    // 점수 기준으로 정렬하고 상위 12개 반환
    const finalVideos = scoredVideos
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 12)
      .map(({ rawViewCount, rawPublishedAt, score, ...video }) => video) // 불필요한 필드 제거
    
    console.log(`최종 반환할 영상 수: ${finalVideos.length}개`)
    return finalVideos
    
  } catch (error) {
    console.error('YouTube 영상 검색 실패:', error)
    return generateMockVideos(keyword)
  }
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
    const { keyword } = await request.json()
    
    if (!keyword) {
      return NextResponse.json(
        { error: '검색 키워드가 필요합니다.' },
        { status: 400 }
      )
    }
    
    console.log(`트렌드 영상 검색: ${keyword}`)
    
    const videos = await searchYouTubeVideos(keyword)
    
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