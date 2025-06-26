'use client'

import React from 'react'
import SentimentChart from './SentimentChart'
import KeywordCloud from './KeywordCloud'

interface Comment {
  text: string
  sentiment: 'positive' | 'neutral' | 'negative'
  keywords: string[]
}

interface CommentAnalysisProps {
  comments: Comment[]
  representativeComments?: {
    positive: Comment[]
    neutral: Comment[]
    negative: Comment[]
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
}

export default function CommentAnalysis({ comments, representativeComments, trends, visual }: CommentAnalysisProps) {
  const totalComments = comments.length
  const sentimentColors = {
    positive: 'text-sentiment-positive',
    neutral: 'text-sentiment-neutral',
    negative: 'text-sentiment-negative'
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        )
      case 'negative':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        )
    }
  }

  const getTopicName = (topic: string) => {
    const topicNames: { [key: string]: string } = {
      content: '내용/정보',
      technical: '기술/개발',
      educational: '교육/학습',
      entertainment: '재미/오락',
      personal: '개인경험'
    }
    return topicNames[topic] || topic
  }

  return (
    <div className="space-y-6">
      {/* 댓글 분석 개요 */}
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">댓글 분석</h3>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            총 {totalComments}개 댓글 분석
          </div>
        </div>

        {/* 감정 분포 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-sentiment-positive">
              {visual.sentimentDistribution.positive}%
            </div>
            <div className="text-sm text-gray-600">긍정적</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-sentiment-neutral">
              {visual.sentimentDistribution.neutral}%
            </div>
            <div className="text-sm text-gray-600">중립적</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-sentiment-negative">
              {visual.sentimentDistribution.negative}%
            </div>
            <div className="text-sm text-gray-600">부정적</div>
          </div>
        </div>

        {/* 감정 분포 차트 */}
        <div className="mb-6">
          <SentimentChart data={visual.sentimentDistribution} />
        </div>
      </div>

      {/* 댓글 트렌드 분석 */}
      {trends && (
        <div className="card">
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">댓글 트렌드</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-600">
                {trends.mostEngaged}개
              </div>
              <div className="text-sm text-gray-600">참여도 높은 댓글</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-green-600">
                {Math.round(trends.questionRatio * 100)}%
              </div>
              <div className="text-sm text-gray-600">질문 비율</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-purple-600">
                {trends.sentimentIntensity.veryPositive}개
              </div>
              <div className="text-sm text-gray-600">강한 긍정</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-xl font-bold text-orange-600">
                {trends.lengthDistribution.long}개
              </div>
              <div className="text-sm text-gray-600">긴 댓글 (100자+)</div>
            </div>
          </div>

          {/* 주제 분포 */}
          {Object.keys(trends.topicDistribution).length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">주요 주제별 언급</h4>
              <div className="space-y-2">
                {Object.entries(trends.topicDistribution)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([topic, count]) => (
                    <div key={topic} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{getTopicName(topic)}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(count / Math.max(...Object.values(trends.topicDistribution))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 min-w-[2rem]">{count}개</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* 키워드 분석 */}
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">주요 키워드</h3>
          </div>
        </div>

        <KeywordCloud keywords={visual.topKeywords} />
      </div>

      {/* 대표 댓글 */}
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">대표 댓글</h3>
          </div>
        </div>

        <div className="space-y-6">
          {['positive', 'neutral', 'negative'].map((sentiment) => {
            const sentimentName = sentiment === 'positive' ? '긍정' : sentiment === 'negative' ? '부정' : '중립'
            const commentsForSentiment = representativeComments?.[sentiment as keyof typeof representativeComments] || 
              comments.filter(c => c.sentiment === sentiment).slice(0, 3)
            
            if (!commentsForSentiment || commentsForSentiment.length === 0) return null

            return (
              <div key={sentiment} className="space-y-3">
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`${sentimentColors[sentiment as keyof typeof sentimentColors]} flex items-center space-x-1`}>
                    {getSentimentIcon(sentiment)}
                    <span className="text-sm font-medium">
                      {sentimentName} 댓글 ({commentsForSentiment.length}개)
                    </span>
                  </span>
                </div>
                
                <div className="space-y-3">
                  {commentsForSentiment.map((comment: any, idx: number) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">
                        {comment.text}
                      </p>
                      
                      {/* 번역된 댓글의 경우 원문 표시 */}
                      {comment.originalText && (
                        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded mt-2">
                          <span className="font-medium">원문:</span> {comment.originalText}
                        </div>
                      )}
                      
                      {/* 고급 분석 정보 */}
                      {comment.analysis && (
                        <div className="mt-2 flex flex-wrap gap-1 text-xs">
                          {comment.analysis.isQuestion && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">질문</span>
                          )}
                          {comment.analysis.engagement === 'high' && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">참여도 높음</span>
                          )}
                          {comment.analysis.topics?.map((topic: string, topicIdx: number) => (
                            <span key={topicIdx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                              {getTopicName(topic)}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {comment.keywords && comment.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {comment.keywords.slice(0, 3).map((keyword: string, keywordIdx: number) => (
                            <span
                              key={keywordIdx}
                              className="px-2 py-1 bg-white text-gray-600 text-xs rounded-md border"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 