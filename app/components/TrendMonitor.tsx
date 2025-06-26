'use client'

import React, { useState, useEffect } from 'react'

interface TrendKeyword {
  keyword: string
  rank: number
  change: 'up' | 'down' | 'new' | 'same'
  searchVolume: string
  category: string
}

interface TrendVideo {
  id: string
  title: string
  thumbnail: string
  views: string
  duration: string
  channelTitle: string
  publishedAt: string
}

interface TrendMonitorProps {
  onVideoSelect?: (videoUrl: string) => void
}

const TrendMonitor: React.FC<TrendMonitorProps> = ({ onVideoSelect }) => {
  const [trendKeywords, setTrendKeywords] = useState<TrendKeyword[]>([])
  const [selectedKeyword, setSelectedKeyword] = useState<string>('')
  const [trendVideos, setTrendVideos] = useState<TrendVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [keywordsLoading, setKeywordsLoading] = useState(true)

  // 트렌드 키워드 로드
  useEffect(() => {
    loadTrendKeywords()
  }, [])

  const loadTrendKeywords = async () => {
    try {
      setKeywordsLoading(true)
      const response = await fetch('/api/trends/keywords')
      const data = await response.json()
      setTrendKeywords(data.keywords || [])
    } catch (error) {
      console.error('트렌드 키워드 로드 실패:', error)
    } finally {
      setKeywordsLoading(false)
    }
  }

  const searchTrendVideos = async (keyword: string) => {
    try {
      console.log('=== 프론트엔드: 트렌드 영상 검색 시작 ===')
      console.log('검색할 키워드:', keyword)
      
      setLoading(true)
      setSelectedKeyword(keyword)
      
      console.log('API 호출 시작: /api/trends/videos')
      const response = await fetch('/api/trends/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ keyword })
      })
      
      console.log('API 응답 상태:', response.status, response.statusText)
      
      if (!response.ok) {
        console.error('API 응답 오류:', response.status, response.statusText)
        throw new Error(`API 오류: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('API 응답 데이터:', data)
      console.log('받은 영상 수:', data.videos?.length || 0)
      
      setTrendVideos(data.videos || [])
      console.log('=== 프론트엔드: 트렌드 영상 검색 완료 ===')
      
    } catch (error) {
      console.error('트렌드 영상 검색 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoClick = (video: TrendVideo) => {
    const videoUrl = `https://www.youtube.com/watch?v=${video.id}`
    if (onVideoSelect) {
      onVideoSelect(videoUrl)
    }
  }

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up': return <span className="text-green-500">📈</span>
      case 'down': return <span className="text-red-500">📉</span>
      case 'new': return <span className="text-blue-500">🆕</span>
      default: return <span className="text-gray-500">➖</span>
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      '엔터테인먼트': 'bg-pink-100 text-pink-800',
      '게임': 'bg-purple-100 text-purple-800',
      '스포츠': 'bg-green-100 text-green-800',
      '뉴스': 'bg-red-100 text-red-800',
      '교육': 'bg-blue-100 text-blue-800',
      '기술': 'bg-gray-100 text-gray-800',
      '음악': 'bg-yellow-100 text-yellow-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
          🔥 AI 트렌드 키워드 모니터링
        </h2>
        <p className="text-gray-600">
          AI 및 기술 관련 실시간 인기 키워드를 확인하고 관련 인기 영상을 탐색하세요
        </p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          🤖 AI 관련 키워드만 표시
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 트렌드 키워드 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">📊 실시간 트렌드</h3>
            <button
              onClick={loadTrendKeywords}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={keywordsLoading}
            >
              {keywordsLoading ? '🔄 로딩중...' : '🔄 새로고침'}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {keywordsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                <p className="text-gray-500">트렌드 키워드를 불러오는 중...</p>
              </div>
            ) : (
              trendKeywords.map((trend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => searchTrendVideos(trend.keyword)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-600 text-sm w-6">
                        {trend.rank}
                      </span>
                      {getChangeIcon(trend.change)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {trend.keyword}
                      </div>
                      <div className="text-xs text-gray-500">
                        검색량: {trend.searchVolume}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(trend.category)}`}>
                    {trend.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 트렌드 영상 */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              🎥 최신 인기 영상
              {selectedKeyword && (
                <span className="text-blue-600 ml-2">#{selectedKeyword}</span>
              )}
            </h3>
            {selectedKeyword && (
              <div className="mt-2 flex flex-wrap gap-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  🕒 최근 6개월 이내
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  👁️ 1만회 이상 조회수
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {!selectedKeyword ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👆</div>
                <p className="text-gray-500">
                  트렌드 키워드를 선택하여<br />관련 인기 영상을 확인하세요
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-2xl mb-2">⏳</div>
                <p className="text-gray-500">영상을 검색하는 중...</p>
              </div>
            ) : trendVideos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">😞</div>
                <p className="text-gray-500">관련 영상을 찾을 수 없습니다</p>
              </div>
            ) : (
              trendVideos.map((video, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 group"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-20 h-14 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white rounded-full p-1.5 shadow-md">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-blue-800 transition-colors">
                      {video.title}
                    </h4>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>{video.channelTitle}</div>
                      <div className="flex items-center space-x-2">
                        <span>👁️ {video.views}</span>
                        <span>⏱️ {video.duration}</span>
                        <span>📅 {video.publishedAt}</span>
                      </div>
                    </div>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="inline-flex items-center text-xs text-blue-600 font-medium">
                        📊 클릭하여 분석하기
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 사용 방법</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 왼쪽 패널에서 실시간 트렌드 키워드를 확인하세요</li>
          <li>• 키워드를 클릭하면 관련 인기 영상이 오른쪽에 표시됩니다</li>
          <li>• 영상을 클릭하면 분석 탭으로 이동하여 해당 영상의 URL이 자동 입력됩니다</li>
          <li>• 분석 탭에서 "분석 시작" 버튼을 클릭하여 상세 분석을 실행하세요</li>
          <li>• 🔄 새로고침 버튼으로 최신 트렌드를 업데이트하세요</li>
        </ul>
      </div>
    </div>
  )
}

export default TrendMonitor 