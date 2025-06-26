'use client'

import React, { useState } from 'react'

interface URLInputProps {
  onAnalyze: (url: string, commentLimit?: number) => void
  isLoading: boolean
}

export default function URLInput({ onAnalyze, isLoading }: URLInputProps) {
  const [url, setUrl] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [commentLimit, setCommentLimit] = useState<number>(100)
  const [error, setError] = useState('')

  const validateYouTubeURL = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/
    return youtubeRegex.test(url)
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

    setError('')
    onAnalyze(url, commentLimit)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
    if (!isValid && e.target.value) {
      setIsValid(true)
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL
          </label>
          <div className="relative">
            <input
              id="youtube-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="comment-limit" className="block text-sm font-medium text-gray-700 mb-2">
            분석할 댓글 개수
          </label>
          <select
            id="comment-limit"
            value={commentLimit}
            onChange={(e) => setCommentLimit(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value={100}>상위 100개 댓글</option>
            <option value={500}>상위 500개 댓글</option>
            <option value={1000}>상위 1000개 댓글</option>
            <option value={-1}>모든 댓글</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            더 많은 댓글을 분석할수록 시간이 오래 걸릴 수 있습니다.
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>분석 중...</span>
            </div>
          ) : (
            '분석 시작'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 사용 팁</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 최신 댓글과 인기 댓글을 모두 분석합니다</li>
          <li>• 한국어가 아닌 콘텐츠는 자동으로 번역됩니다</li>
          <li>• 더 많은 댓글을 선택하면 더 정확한 분석 결과를 얻을 수 있습니다</li>
        </ul>
      </div>
    </div>
  )
} 