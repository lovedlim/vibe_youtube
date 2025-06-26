'use client'

import { useState } from 'react'
import URLInput from './components/URLInput'
import VideoSummary from './components/VideoSummary'
import CommentAnalysis from './components/CommentAnalysis'
import LoadingSkeleton from './components/LoadingSkeleton'
import MarketingReport from './components/MarketingReport'
import TrendMonitor from './components/TrendMonitor'

interface AnalysisData {
  summary: string
  videoInfo: {
    title: string
    thumbnail: string
    duration: string
    views: string
    description?: string
    channelTitle?: string
  }
  comments: Array<{
    text: string
    sentiment: 'positive' | 'neutral' | 'negative'
    keywords: string[]
  }>
  representativeComments?: {
    positive: Array<{
      text: string
      sentiment: 'positive' | 'neutral' | 'negative'
      keywords: string[]
    }>
    neutral: Array<{
      text: string
      sentiment: 'positive' | 'neutral' | 'negative'
      keywords: string[]
    }>
    negative: Array<{
      text: string
      sentiment: 'positive' | 'neutral' | 'negative'
      keywords: string[]
    }>
  }
  trends?: {
    mostEngaged: number
    questionRatio: number
    topicDistribution: { [key: string]: number }
    sentimentIntensity: {
      veryPositive: number
      veryNegative: number
      neutral: number
    }
    lengthDistribution: {
      short: number
      medium: number
      long: number
    }
  }
  visual: {
    sentimentDistribution: {
      positive: number
      neutral: number
      negative: number
    }
    topKeywords: string[]
  }
  metadata?: {
    totalComments: number
    hasTranscript: boolean
    dataSource: 'youtube_api' | 'fallback'
  }
}

export default function Home() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'trends' | 'analysis' | 'marketing'>('trends')

  const handleAnalyze = async (url: string, commentLimit?: number) => {
    setIsLoading(true)
    setError(null)
    setAnalysisData(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, commentLimit }),
      })

      if (!response.ok) {
        throw new Error('분석 중 오류가 발생했습니다.')
      }

      const data = await response.json()
      setAnalysisData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            🎬 YouTube Vibe Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            트렌드 키워드 모니터링과 유튜브 영상 분석을 통해
            최신 이슈와 반응을 한눈에 파악해보세요
          </p>
        </div>

        {activeTab !== 'trends' && (
          <div className="max-w-2xl mx-auto mb-8">
            <URLInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-6">
            <LoadingSkeleton />
          </div>
        )}

        <div className="flex bg-white rounded-lg p-1 shadow-md mb-6 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🔥 트렌드 모니터링
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            disabled={!analysisData}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analysis'
                ? 'bg-blue-600 text-white'
                : analysisData
                  ? 'text-gray-600 hover:text-gray-800'
                  : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            📊 기본 분석
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            disabled={!analysisData}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'marketing'
                ? 'bg-blue-600 text-white'
                : analysisData
                  ? 'text-gray-600 hover:text-gray-800'
                  : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            📈 마케팅 리포트
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'trends' && (
            <div className="animate-fade-in">
              <TrendMonitor 
                onVideoSelect={(url) => {
                  handleAnalyze(url)
                  setActiveTab('analysis')
                }}
              />
            </div>
          )}

          {activeTab === 'analysis' && analysisData && (
            <div className="animate-fade-in">
              {analysisData.metadata && (
                <div className="max-w-4xl mx-auto mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-blue-800">분석 정보</span>
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• 데이터 소스: {analysisData.metadata.dataSource === 'youtube_api' ? '실제 YouTube API' : '샘플 데이터'}</p>
                      <p>• 총 댓글 수: {analysisData.metadata.totalComments}개</p>
                      <p>• 자막 추출: {analysisData.metadata.hasTranscript ? '성공' : '실패 (기본 요약 사용)'}</p>
                      {analysisData.metadata.dataSource === 'fallback' && (
                        <p className="text-yellow-700">⚠️ YouTube API 키가 설정되지 않아 샘플 데이터를 사용했습니다. 실제 데이터 사용을 원하시면 SETUP.md를 참고하세요.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <VideoSummary 
                summary={analysisData.summary} 
                videoInfo={analysisData.videoInfo} 
              />
              
              <CommentAnalysis 
                comments={analysisData.comments}
                representativeComments={analysisData.representativeComments}
                trends={analysisData.trends}
                visual={analysisData.visual}
              />
            </div>
          )}

          {activeTab === 'marketing' && analysisData && (
            <div className="animate-fade-in">
              <MarketingReport data={{
                ...analysisData,
                representativeComments: analysisData.representativeComments || {
                  positive: [],
                  neutral: [],
                  negative: []
                },
                trends: analysisData.trends || {
                  mostEngaged: 0,
                  questionRatio: 0,
                  topicDistribution: {},
                  sentimentIntensity: {
                    veryPositive: 0,
                    veryNegative: 0,
                    neutral: 0
                  },
                  lengthDistribution: {
                    short: 0,
                    medium: 0,
                    long: 0
                  }
                },
                metadata: analysisData.metadata || {
                  totalComments: 0,
                  hasTranscript: false,
                  dataSource: 'fallback' as const
                }
              }} />
            </div>
          )}

          {(activeTab === 'analysis' || activeTab === 'marketing') && !analysisData && !isLoading && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m4 0H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM9 12l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                분석할 영상을 선택해주세요
              </h3>
              <p className="text-gray-400">
                상단에서 유튜브 URL을 입력하거나 트렌드 탭에서 인기 영상을 선택하세요
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 