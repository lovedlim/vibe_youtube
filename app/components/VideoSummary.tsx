'use client'

import React from 'react'

interface VideoSummaryProps {
  summary: string
  videoInfo: {
    title: string
    thumbnail: string
    duration: string
    views: string
  }
}

export default function VideoSummary({ summary, videoInfo }: VideoSummaryProps) {
  return (
    <div className="card">
      <div className="flex items-start space-x-4 mb-6">
        <div className="flex-shrink-0">
          <img
            src={videoInfo.thumbnail}
            alt={videoInfo.title}
            className="w-32 h-20 object-cover rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {videoInfo.title}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {videoInfo.duration}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {videoInfo.views}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">영상 요약</h3>
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {summary}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>자막 기반 자동 요약</span>
          <button 
            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 transition-colors"
            onClick={() => navigator.clipboard.writeText(summary)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>복사</span>
          </button>
        </div>
      </div>
    </div>
  )
}