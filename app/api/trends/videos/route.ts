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
    // AI 관련 키워드와 함께 검색하여 더 관련성 높은 결과 얻기
    const enhancedKeyword = `${keyword} AI 인공지능 기술`
    
    // 최근 6개월 이내의 영상만 검색하도록 날짜 제한 (더 엄격하게)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const publishedAfter = sixMonthsAgo.toISOString()
    
    // 1단계: 인기순으로 검색 (조회수 높은 영상 우선)
    const popularResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(enhancedKeyword)}&type=video&order=viewCount&regionCode=KR&publishedAfter=${publishedAfter}&maxResults=15&key=${YOUTUBE_API_KEY}`
    )
    
    // 2단계: 최신순으로도 검색 (최신 트렌드 포함)
    const recentResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(enhancedKeyword)}&type=video&order=date&regionCode=KR&publishedAfter=${publishedAfter}&maxResults=10&key=${YOUTUBE_API_KEY}`
    )
    
    let allVideos: any[] = []
    
    // 인기순 결과 처리
    if (popularResponse.ok) {
      const popularData = await popularResponse.json()
      if (popularData.items) {
        allVideos = [...allVideos, ...popularData.items]
      }
    }
    
    // 최신순 결과 추가 (중복 제거)
    if (recentResponse.ok) {
      const recentData = await recentResponse.json()
      if (recentData.items) {
        const existingIds = new Set(allVideos.map(item => item.id.videoId))
        const newVideos = recentData.items.filter((item: any) => !existingIds.has(item.id.videoId))
        allVideos = [...allVideos, ...newVideos]
      }
    }
    
    // AI 키워드 없이 fallback 시도
    if (allVideos.length < 5) {
      const fallbackResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&order=viewCount&regionCode=KR&publishedAfter=${publishedAfter}&maxResults=15&key=${YOUTUBE_API_KEY}`
      )
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        if (fallbackData.items) {
          const existingIds = new Set(allVideos.map(item => item.id.videoId))
          const newVideos = fallbackData.items.filter((item: any) => !existingIds.has(item.id.videoId))
          allVideos = [...allVideos, ...newVideos]
        }
      }
    }
    
    if (allVideos.length === 0) {
      return []
    }
    
    // 영상 상세 정보 가져오기
    const videoIds = allVideos.slice(0, 25).map((item: any) => item.id.videoId).join(',')
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )
    
    const detailsData = await detailsResponse.json()
    
    // 데이터 결합 및 조회수 필터링
    const videos = allVideos.slice(0, 25).map((searchItem: any) => {
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
      // 최소 조회수 필터링 (1만회 이상)
      return video.rawViewCount >= 10000
    })
    
    // 조회수와 최신성을 조합한 점수로 정렬
    const scoredVideos = videos.map((video: any) => {
      const daysSincePublished = Math.floor((Date.now() - new Date(video.rawPublishedAt).getTime()) / (1000 * 60 * 60 * 24))
      const viewScore = Math.log10(video.rawViewCount + 1) // 로그 스케일로 조회수 점수
      const recencyScore = Math.max(0, 180 - daysSincePublished) / 180 // 6개월 이내일수록 높은 점수
      const totalScore = viewScore * 0.7 + recencyScore * 0.3 // 조회수 70%, 최신성 30%
      
      return {
        ...video,
        score: totalScore
      }
    })
    
    // 점수 기준으로 정렬하고 상위 12개 반환
    return scoredVideos
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 12)
      .map(({ rawViewCount, rawPublishedAt, score, ...video }) => video) // 불필요한 필드 제거
    
  } catch (error) {
    console.error('YouTube 영상 검색 실패:', error)
    return generateMockVideos(keyword)
  }
}

// 모의 영상 데이터 생성
function generateMockVideos(keyword: string) {
  const mockVideos = [
    {
      id: 'mock1',
      title: `${keyword} 완벽 가이드 - 초보자도 이해할 수 있는 쉬운 설명`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '15.2만회',
      duration: '12:34',
      channelTitle: '트렌드 채널',
      publishedAt: '1일 전'
    },
    {
      id: 'mock2',
      title: `${keyword} 최신 트렌드 분석 2024`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '8.7만회',
      duration: '8:45',
      channelTitle: '인기 유튜버',
      publishedAt: '3일 전'
    },
    {
      id: 'mock3',
      title: `${keyword}에 대해 알아야 할 모든 것`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '23.1만회',
      duration: '15:22',
      channelTitle: '전문가 채널',
      publishedAt: '5일 전'
    },
    {
      id: 'mock4',
      title: `${keyword} 실시간 리뷰 및 반응`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '5.4만회',
      duration: '6:18',
      channelTitle: '리뷰어',
      publishedAt: '2일 전'
    },
    {
      id: 'mock5',
      title: `${keyword} 2024년 최신 업데이트 소식`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '12.8만회',
      duration: '9:42',
      channelTitle: '뉴스 채널',
      publishedAt: '4일 전'
    },
    {
      id: 'mock6',
      title: `${keyword} 실전 활용법 - 지금 바로 시작하세요`,
      thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
      views: '7.3만회',
      duration: '11:15',
      channelTitle: '실용 채널',
      publishedAt: '6일 전'
    }
  ]
  
  return mockVideos
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