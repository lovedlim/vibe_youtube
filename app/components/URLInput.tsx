'use client'

import React, { useState, useEffect } from 'react'

interface URLInputProps {
  onAnalyze: (url: string, commentLimit?: number) => void
  isLoading: boolean
  selectedUrl?: string
}

export default function URLInput({ onAnalyze, isLoading, selectedUrl }: URLInputProps) {
  const [url, setUrl] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [commentLimit, setCommentLimit] = useState<number>(100)
  const [error, setError] = useState('')

  // 예시 URL들
  const exampleUrls = [
    {
      title: '인기 AI 영상',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'AI 기술 트렌드'
    },
    {
      title: '게임 리뷰',
      url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      description: '최신 게임 분석'
    },
    {
      title: '요리 레시피',
      url: 'https://www.youtube.com/watch?v=BROWqjuTM0g',
      description: '인기 요리 영상'
    }
  ]

  const validateYouTubeURL = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/
    return youtubeRegex.test(url)
  }

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError('YouTube URL을 입력해주세요.')
      return
    }

    if (!validateYouTubeURL(url)) {
      setError('올바른 YouTube URL을 입력해주세요.')
      return
    }

    // URL 정규화
    const videoId = extractVideoId(url)
    if (videoId) {
      const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`
      setError('')
      onAnalyze(normalizedUrl, commentLimit)
    } else {
      setError('YouTube 영상 ID를 찾을 수 없습니다.')
    }
  }

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl)
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    setError('')
    
    if (newUrl && !validateYouTubeURL(newUrl)) {
      setError('올바른 YouTube URL 형식이 아닙니다.')
    }
  }

  // 외부에서 선택된 URL이 변경될 때 입력 필드 업데이트
  useEffect(() => {
    if (selectedUrl && selectedUrl !== url) {
      setUrl(selectedUrl)
      setError('')
    }
  }, [selectedUrl, url])

  return (
    <div className="card bg-white shadow-lg border-0">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">YouTube 영상 분석</h2>
            <p className="text-sm text-gray-600">URL을 입력하여 영상과 댓글을 분석해보세요</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-3">
            YouTube URL
          </label>
          <div className="relative">
            <input
              id="youtube-url"
              type="url"
              value={url}
              onChange={handleInputChange}
              placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
              className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          
          {/* 예시 URL 버튼들 */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">💡 예시 영상으로 테스트해보기:</p>
            <div className="flex flex-wrap gap-2">
              {exampleUrls.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleExampleClick(example.url)}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors disabled:opacity-50"
                  title={example.description}
                >
                  {example.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="comment-limit" className="block text-sm font-medium text-gray-700 mb-3">
            분석할 댓글 개수
          </label>
          <select
            id="comment-limit"
            value={commentLimit}
            onChange={(e) => setCommentLimit(Number(e.target.value))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            disabled={isLoading}
          >
            <option value={100}>상위 100개 댓글 (빠름)</option>
            <option value={500}>상위 500개 댓글 (보통)</option>
            <option value={1000}>상위 1000개 댓글 (느림)</option>
            <option value={-1}>모든 댓글 (매우 느림)</option>
          </select>
          <p className="mt-2 text-xs text-gray-500">
            💡 더 많은 댓글을 분석할수록 정확도는 높아지지만 시간이 오래 걸립니다.
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !url || !!error}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>분석 중...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>분석 시작</span>
            </div>
          )}
        </button>
      </form>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          분석 기능 안내
        </h4>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">📊</span>
            댓글 감정 분석 및 키워드 추출
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">🎯</span>
            영상 내용 요약 및 주요 포인트 분석
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">📈</span>
            마케팅 인사이트 및 개선 제안
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">🌍</span>
            다국어 콘텐츠 자동 번역 지원
          </li>
        </ul>
      </div>
    </div>
  )
} 