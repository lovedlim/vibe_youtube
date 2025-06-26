'use client'

import React from 'react'

interface MarketingReportProps {
  data: {
    summary: string
    videoInfo: any
    comments: any[]
    representativeComments: any
    trends: any
    visual: {
      sentimentDistribution: any
      topKeywords: string[]
    }
    metadata: any
  }
}

const MarketingReport: React.FC<MarketingReportProps> = ({ data }) => {
  const { 
    summary, 
    videoInfo, 
    comments, 
    representativeComments, 
    trends, 
    visual, 
    metadata 
  } = data

  // 마케팅 인사이트 계산
  const calculateMarketingInsights = () => {
    const totalComments = comments.length
    // visual.sentimentDistribution.positive는 이미 백분율로 계산됨
    const positiveRate = visual?.sentimentDistribution?.positive || 0
    const engagementRate = Number(positiveRate).toFixed(1)
    
    // 브랜드 언급 분석
    const brandMentions = comments.filter(comment => 
      comment?.text && (
        comment.text.includes('브랜드') || 
        comment.text.includes('제품') || 
        comment.text.includes('회사')
      )
    )
    
    // 구매 의도 키워드
    const purchaseIntentKeywords = ['사고싶', '구매', '주문', '살게', '사야지', '갖고싶', '살까', '사려고']
    const purchaseIntent = comments.filter(comment =>
      comment?.text && purchaseIntentKeywords.some(keyword => comment.text.includes(keyword))
    )
    
    // 추천 키워드
    const recommendationKeywords = ['추천', '강추', '꼭봐', '필수', '최고', '좋다', '좋네', '강력추천']
    const recommendations = comments.filter(comment =>
      comment?.text && recommendationKeywords.some(keyword => comment.text.includes(keyword))
    )

    return {
      engagementRate,
      brandMentions: brandMentions.length,
      purchaseIntent: purchaseIntent.length,
      recommendations: recommendations.length,
      totalComments
    }
  }

  const insights = calculateMarketingInsights()

  // 액션 아이템 생성
  const generateActionItems = () => {
    const items = []
    
    // visual.sentimentDistribution는 이미 백분율
    const negativeRate = visual?.sentimentDistribution?.negative || 0
    const positiveRate = visual?.sentimentDistribution?.positive || 0
    
    if (negativeRate > 30) {
      items.push({
        priority: 'high',
        action: '부정적 피드백 대응',
        description: `부정적 댓글이 ${negativeRate}%로 30%를 초과했습니다. 고객 서비스 개선이 필요합니다.`
      })
    }
    
    if (insights.purchaseIntent > 0) {
      items.push({
        priority: 'medium',
        action: '구매 유도 강화',
        description: `${insights.purchaseIntent}개의 구매 의도 댓글이 발견됐습니다. 전환율 최적화가 가능합니다.`
      })
    }
    
    if (positiveRate >= 60) {
      items.push({
        priority: 'low',
        action: '긍정적 반응 활용',
        description: `긍정적 반응이 ${positiveRate}%로 높습니다. 성공 사례로 활용 가능합니다.`
      })
    }

    return items
  }

  const actionItems = generateActionItems()

  const downloadReport = () => {
    const reportData = {
      title: `${videoInfo.title} - 마케팅 반응 분석 리포트`,
      date: new Date().toLocaleDateString('ko-KR'),
      insights,
      sentimentDistribution: visual.sentimentDistribution,
      topKeywords: visual.topKeywords,
      actionItems,
      representativeComments
    }
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `marketing-report-${Date.now()}.json`
    link.click()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* 헤더 */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            📊 마케팅 반응 분석 리포트
          </h2>
          <p className="text-gray-600">
            생성일: {new Date().toLocaleDateString('ko-KR')} | 
            분석 댓글: {insights.totalComments}개
          </p>
        </div>
        <button
          onClick={downloadReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          📥 리포트 다운로드
        </button>
      </div>

      {/* 핵심 지표 대시보드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{insights.engagementRate}%</div>
          <div className="text-sm text-green-700">긍정 반응률</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">{insights.brandMentions}</div>
          <div className="text-sm text-blue-700">브랜드 언급</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">{insights.purchaseIntent}</div>
          <div className="text-sm text-purple-700">구매 의도</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-2xl font-bold text-orange-600">{insights.recommendations}</div>
          <div className="text-sm text-orange-700">추천 언급</div>
        </div>
      </div>

      {/* 감정 분석 요약 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 감정 분석 요약</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-600">긍정적</span>
            <span className="font-semibold">{visual?.sentimentDistribution?.positive || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${visual?.sentimentDistribution?.positive || 0}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">중립적</span>
            <span className="font-semibold">{visual?.sentimentDistribution?.neutral || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gray-500 h-2 rounded-full"
              style={{ width: `${visual?.sentimentDistribution?.neutral || 0}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-600">부정적</span>
            <span className="font-semibold">{visual?.sentimentDistribution?.negative || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{ width: `${visual?.sentimentDistribution?.negative || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 핵심 키워드 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 핵심 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {(visual?.topKeywords || []).slice(0, 10).map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              #{keyword}
            </span>
          ))}
          {(!visual?.topKeywords || visual.topKeywords.length === 0) && (
            <span className="text-gray-500 text-sm">키워드를 분석 중입니다...</span>
          )}
        </div>
      </div>

      {/* 대표 댓글 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💬 대표 댓글</h3>
        <div className="space-y-4">
          {['positive', 'neutral', 'negative'].map((sentiment) => (
            <div key={sentiment} className="border rounded-lg p-4">
              <h4 className={`font-medium mb-2 ${
                sentiment === 'positive' ? 'text-green-600' : 
                sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {sentiment === 'positive' ? '😊 긍정적 반응' : 
                 sentiment === 'negative' ? '😞 부정적 반응' : '😐 중립적 반응'}
              </h4>
              {(representativeComments?.[sentiment] || []).slice(0, 2).map((comment: any, index: number) => (
                <div key={index} className="bg-gray-50 p-3 rounded mb-2 last:mb-0">
                  <p className="text-sm text-gray-700">&quot;{comment?.text || '댓글 내용을 불러올 수 없습니다.'}&quot;</p>
                  <p className="text-xs text-gray-500 mt-1">- {comment?.author || '익명'}</p>
                </div>
              ))}
              {(!representativeComments?.[sentiment] || representativeComments[sentiment].length === 0) && (
                <div className="bg-gray-50 p-3 rounded text-center">
                  <p className="text-sm text-gray-500">해당 감정의 대표 댓글이 없습니다.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 액션 아이템 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 권장 액션 아이템</h3>
        <div className="space-y-3">
          {actionItems.map((item, index) => (
            <div
              key={index}
              className={`border-l-4 p-4 ${
                item.priority === 'high' ? 'border-red-500 bg-red-50' :
                item.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-green-500 bg-green-50'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                  item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.priority === 'high' ? '높음' : item.priority === 'medium' ? '보통' : '낮음'}
                </span>
                <h4 className="font-semibold text-gray-800 ml-2">{item.action}</h4>
              </div>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 트렌드 분석 */}
      {trends && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 트렌드 분석</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">평균 댓글 길이</h4>
              <div className="text-2xl font-bold text-blue-600">
                {trends.averageLength?.toFixed(0) || 0}자
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">질문 댓글</h4>
              <div className="text-2xl font-bold text-purple-600">
                {trends.questionCount || 0}개
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">높은 참여도</h4>
              <div className="text-2xl font-bold text-orange-600">
                {trends.highEngagement || 0}개
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 마케팅 인사이트 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 마케팅 인사이트</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <p className="text-gray-700">
              <strong>타겟 오디언스:</strong> 
              {(visual?.sentimentDistribution?.positive || 0) > 60 ? 
                ' 현재 콘텐츠에 대한 반응이 매우 긍정적입니다. 유사한 타겟층에게 확대 마케팅을 고려해보세요.' :
                ' 타겟 오디언스의 니즈를 더 깊이 분석하여 콘텐츠 개선이 필요합니다.'
              }
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mr-2">•</span>
            <p className="text-gray-700">
              <strong>콘텐츠 전략:</strong> 
              {(visual?.topKeywords && visual.topKeywords.length > 0) ? 
                `상위 키워드(${visual.topKeywords.slice(0, 3).join(', ')})를 활용한 후속 콘텐츠 제작을 권장합니다.` :
                '키워드 분석을 통한 후속 콘텐츠 전략을 수립하세요.'
              }
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">•</span>
            <p className="text-gray-700">
              <strong>전환 최적화:</strong> 
              {insights.purchaseIntent > 0 ? 
                `구매 의도를 보인 ${insights.purchaseIntent}명의 사용자에게 타겟 마케팅을 진행하세요.` :
                '구매 유도 요소를 강화한 콘텐츠 개발이 필요합니다.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketingReport 