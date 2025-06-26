import './globals.css'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'YouTube Vibe Analyzer',
  description: '유튜브 영상 요약 및 댓글 분석 시각화 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="font-sans">
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-primary-700">
                    YouTube Vibe Analyzer
                  </h1>
                </div>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 