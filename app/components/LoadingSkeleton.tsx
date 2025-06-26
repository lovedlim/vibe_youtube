'use client'

import React from 'react'

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 영상 정보 스켈레톤 */}
      <div className="card">
        <div className="flex items-start space-x-4 mb-6">
          <div className="skeleton w-32 h-20"></div>
          <div className="flex-1 space-y-3">
            <div className="skeleton h-5 w-3/4"></div>
            <div className="skeleton h-4 w-1/2"></div>
            <div className="flex space-x-4">
              <div className="skeleton h-4 w-16"></div>
              <div className="skeleton h-4 w-20"></div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="skeleton w-8 h-8 rounded-full"></div>
            <div className="skeleton h-5 w-20"></div>
          </div>
          <div className="space-y-3">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-5/6"></div>
            <div className="skeleton h-4 w-4/5"></div>
            <div className="skeleton h-4 w-3/4"></div>
          </div>
        </div>
      </div>

      {/* 댓글 분석 스켈레톤 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="skeleton w-8 h-8 rounded-full"></div>
            <div className="skeleton h-5 w-24"></div>
          </div>
          <div className="skeleton h-4 w-32"></div>
        </div>

        {/* 감정 분포 통계 스켈레톤 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="skeleton h-8 w-12 mx-auto mb-2"></div>
              <div className="skeleton h-4 w-16 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* 차트 스켈레톤 */}
        <div className="mb-6">
          <div className="skeleton h-4 w-24 mb-3"></div>
          <div className="skeleton h-8 w-full rounded-full"></div>
          <div className="flex justify-between mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-3 w-16"></div>
            ))}
          </div>
        </div>
      </div>

      {/* 키워드 분석 스켈레톤 */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <div className="skeleton w-8 h-8 rounded-full"></div>
          <div className="skeleton h-5 w-20"></div>
        </div>

        <div className="min-h-[200px] flex flex-wrap items-center justify-center gap-3 p-6 bg-gray-50 rounded-lg">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className={`skeleton rounded-full ${
              i <= 2 ? 'h-10 w-24' : i <= 4 ? 'h-8 w-20' : 'h-6 w-16'
            }`}></div>
          ))}
        </div>
      </div>

      {/* 대표 댓글 스켈레톤 */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <div className="skeleton w-8 h-8 rounded-full"></div>
          <div className="skeleton h-5 w-20"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="skeleton w-4 h-4 rounded-full"></div>
                <div className="skeleton h-4 w-12"></div>
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-3/4"></div>
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="skeleton h-6 w-16 rounded-md"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 