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
    console.log(`YouTube API로 검색 시작: "${keyword}"`)
    
    // 키워드 정리 - 특수문자 제거
    const cleanKeyword = keyword.replace(/[#@]/g, '').trim()
    console.log(`정리된 키워드: "${cleanKeyword}"`)
    
    if (!cleanKeyword) {
      console.log('키워드가 비어있어서 모의 데이터 반환')
      return generateMockVideos(keyword)
    }
    
    // 최근 6개월로 범위 설정
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const publishedAfter = sixMonthsAgo.toISOString()
    
    console.log(`검색 범위: ${publishedAfter} 이후`)
    
    // 단순하고 관대한 검색 (한 번만 시도)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(cleanKeyword)}&type=video&order=relevance&regionCode=KR&publishedAfter=${publishedAfter}&maxResults=25&key=${YOUTUBE_API_KEY}`
    
    console.log('YouTube API 요청 시작...')
    const searchResponse = await fetch(searchUrl)
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('YouTube 검색 API 오류:', {
        status: searchResponse.status,
        statusText: searchResponse.statusText,
        error: errorText
      })
      return generateMockVideos(keyword)
    }
    
    const searchData = await searchResponse.json()
    console.log(`검색 결과: ${searchData.items?.length || 0}개`)
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log('검색 결과가 없어서 모의 데이터 반환')
      return generateMockVideos(keyword)
    }
    
    // 영상 상세 정보 가져오기
    const videoIds = searchData.items.slice(0, 20).map((item: any) => item.id.videoId).join(',')
    console.log(`상세 정보 요청할 영상 수: ${searchData.items.slice(0, 20).length}개`)
    
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )
    
    if (!detailsResponse.ok) {
      console.error('영상 상세 정보 요청 실패:', detailsResponse.status, detailsResponse.statusText)
      // 상세 정보 없이도 기본 정보로 반환
      const basicVideos = searchData.items.slice(0, 12).map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        views: '조회수 정보 없음',
        duration: '시간 정보 없음',
        channelTitle: item.snippet.channelTitle,
        publishedAt: formatPublishedDate(item.snippet.publishedAt)
      }))
      
      console.log(`기본 정보로 ${basicVideos.length}개 영상 반환`)
      return basicVideos
    }
    
    const detailsData = await detailsResponse.json()
    console.log(`상세 정보 받은 영상 수: ${detailsData.items?.length || 0}개`)
    
    // 데이터 결합 (조회수 필터링 제거 - 모든 영상 포함)
    const videos = searchData.items.slice(0, 15).map((searchItem: any) => {
      const details = detailsData.items?.find((detail: any) => detail.id === searchItem.id.videoId)
      const viewCount = parseInt(details?.statistics?.viewCount || '0')
      
      return {
        id: searchItem.id.videoId,
        title: searchItem.snippet.title,
        thumbnail: searchItem.snippet.thumbnails.medium?.url || searchItem.snippet.thumbnails.default?.url,
        views: viewCount > 0 ? formatViewCount(viewCount) : '조회수 정보 없음',
        duration: details?.contentDetails?.duration ? formatDuration(details.contentDetails.duration) : '시간 정보 없음',
        channelTitle: searchItem.snippet.channelTitle,
        publishedAt: formatPublishedDate(searchItem.snippet.publishedAt),
        rawViewCount: viewCount,
        rawPublishedAt: searchItem.snippet.publishedAt
      }
    })
    
    // 조회수 순으로 정렬 (0도 포함)
    const sortedVideos = videos.sort((a: any, b: any) => b.rawViewCount - a.rawViewCount)
    
    console.log(`최종 반환할 영상 수: ${sortedVideos.length}개`)
    return sortedVideos.slice(0, 12)
    
  } catch (error) {
    console.error('YouTube 검색 중 오류 발생:', error)
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