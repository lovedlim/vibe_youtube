'use client'

import React from 'react'

interface SentimentChartProps {
  data: {
    positive: number
    neutral: number
    negative: number
  }
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const total = data.positive + data.neutral + data.negative
  
  return (
    <div className="w-full">
      <h4 className="text-sm font-medium text-gray-700 mb-3">감정 분포</h4>
      
      {/* Progress bar style chart */}
      <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
        <div className="flex h-full">
          <div 
            className="bg-sentiment-positive transition-all duration-500"
            style={{ width: `${data.positive}%` }}
          />
          <div 
            className="bg-sentiment-neutral transition-all duration-500"
            style={{ width: `${data.neutral}%` }}
          />
          <div 
            className="bg-sentiment-negative transition-all duration-500"
            style={{ width: `${data.negative}%` }}
          />
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-sentiment-positive rounded-full"></div>
          <span>긍정 {data.positive}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-sentiment-neutral rounded-full"></div>
          <span>중립 {data.neutral}%</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-sentiment-negative rounded-full"></div>
          <span>부정 {data.negative}%</span>
        </div>
      </div>
    </div>
  )
} 