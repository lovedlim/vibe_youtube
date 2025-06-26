'use client'

import React from 'react'

interface KeywordCloudProps {
  keywords: string[]
}

export default function KeywordCloud({ keywords }: KeywordCloudProps) {
  const getKeywordSize = (index: number) => {
    // 키워드 빈도에 따른 크기 설정 (첫 번째가 가장 크고 점점 작아짐)
    const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm']
    return sizes[Math.min(index, sizes.length - 1)]
  }

  const getKeywordColor = (index: number) => {
    // 키워드 중요도에 따른 색상 설정
    const colors = [
      'text-primary-600',
      'text-primary-500', 
      'text-primary-400',
      'text-gray-600',
      'text-gray-500'
    ]
    return colors[Math.min(index, colors.length - 1)]
  }

  if (!keywords || keywords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <p>추출된 키워드가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="min-h-[200px] flex flex-wrap items-center justify-center gap-3 p-6 bg-gray-50 rounded-lg">
      {keywords.slice(0, 10).map((keyword, index) => (
        <span
          key={index}
          className={`
            ${getKeywordSize(index)} 
            ${getKeywordColor(index)} 
            font-semibold 
            hover:scale-110 
            transition-transform 
            duration-200 
            cursor-pointer
            px-3 
            py-1 
            bg-white 
            rounded-full 
            shadow-sm 
            hover:shadow-md
          `}
        >
          #{keyword}
        </span>
      ))}
    </div>
  )
} 