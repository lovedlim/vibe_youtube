import { NextRequest, NextResponse } from 'next/server'

// YouTube 자막 추출 함수
async function getYouTubeSubtitles(videoId: string): Promise<string> {
  try {
    // youtube-captions-scraper 라이브러리 사용
    const { getSubtitles } = await import('youtube-captions-scraper')

    const captions = await getSubtitles({
      videoID: videoId,
      lang: 'ko' // 한국어 우선
    })

    if (captions && captions.length > 0) {
      return captions.map(caption => caption.text).join(' ')
    }

    // 한국어 자막이 없으면 영어 시도
    const englishCaptions = await getSubtitles({
      videoID: videoId,
      lang: 'en'
    })

    if (englishCaptions && englishCaptions.length > 0) {
      return englishCaptions.map(caption => caption.text).join(' ')
    }

    return ''
  } catch (error) {
    console.log('자막 추출 오류:', error)
    return ''
  }
}

// 실제 YouTube 영상 정보 가져오기
async function getYouTubeVideoInfo(videoId: string) {
  const API_KEY = process.env.YOUTUBE_API_KEY
  
  if (!API_KEY) {
    console.warn('YouTube API 키가 설정되지 않았습니다. 모의 데이터를 사용합니다.')
    return null
  }
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error('YouTube API 호출 실패')
    }
    
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      throw new Error('영상을 찾을 수 없습니다')
    }
    
    const video = data.items[0]
    const snippet = video.snippet
    const statistics = video.statistics
    const contentDetails = video.contentDetails
    
    // 지속 시간 포맷팅 (PT4M20S -> 4:20)
    const duration = formatDuration(contentDetails.duration)
    
    // 조회수 포맷팅
    const viewCount = parseInt(statistics.viewCount).toLocaleString('ko-KR')
    
    return {
      title: snippet.title,
      thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
      duration: duration,
      views: `${viewCount}회`,
      description: snippet.description,
      publishedAt: snippet.publishedAt,
      channelTitle: snippet.channelTitle
    }
  } catch (error) {
    console.error('YouTube API 오류:', error)
    return null
  }
}

// 실제 YouTube 댓글 가져오기 (개수 제한 포함)
async function getYouTubeComments(videoId: string, limit: number = 100): Promise<Array<{text: string, author: string}>> {
  const API_KEY = process.env.YOUTUBE_API_KEY
  
  if (!API_KEY) {
    console.warn('YouTube API 키가 설정되지 않았습니다. 모의 데이터를 사용합니다.')
    return getMockComments(videoId)
  }
  
  try {
    let allComments: Array<{text: string, author: string}> = []
    let nextPageToken = ''
    const maxResults = Math.min(limit === -1 ? 100 : limit, 100) // API 한번에 최대 100개
    const totalLimit = limit === -1 ? 10000 : limit // 모든 댓글의 경우 최대 10,000개로 제한
    
    while (allComments.length < totalLimit) {
      const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&maxResults=${maxResults}&order=relevance${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('댓글 가져오기 실패')
      }
      
      const data = await response.json()
      
      if (!data.items || data.items.length === 0) {
        break
      }
      
      const comments = data.items.map((item: any) => ({
        text: item.snippet.topLevelComment.snippet.textDisplay,
        author: item.snippet.topLevelComment.snippet.authorDisplayName
      }))
      
      allComments.push(...comments)
      
      // 다음 페이지가 없거나 원하는 개수만큼 수집했으면 중단
      if (!data.nextPageToken || (limit !== -1 && allComments.length >= limit)) {
        break
      }
      
      nextPageToken = data.nextPageToken
    }
    
    return limit === -1 ? allComments : allComments.slice(0, limit)
  } catch (error) {
    console.error('댓글 가져오기 오류:', error)
    return getMockComments(videoId)
  }
}

// LLM을 활용한 고급 영상 요약 생성
async function generateAdvancedSummary(transcript: string, videoInfo: any, comments: string[]): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  
  if (!OPENAI_API_KEY) {
    // OpenAI API가 없는 경우 기본 요약 생성
    if (videoInfo && transcript) {
      return `"${videoInfo.title}" 영상은 ${videoInfo.channelTitle} 채널에서 제작한 콘텐츠입니다. 자막 분석을 통해 다양한 주제를 다루고 있음을 확인했습니다. 댓글 반응은 대체로 긍정적이며, 시청자들이 관심을 가지고 참여하고 있습니다.`
    }
    return '영상 요약을 생성할 수 없습니다. API 키를 확인해주세요.'
  }
  
  try {
    // 댓글에서 주요 반응 키워드 추출
    const commentSample = comments.slice(0, 20).join(' ')
    
    const prompt = transcript 
      ? `다음은 YouTube 영상의 정보입니다:
제목: "${videoInfo?.title || '제목 없음'}"
채널: ${videoInfo?.channelTitle || '알 수 없음'}

자막 내용:
${transcript.slice(0, 2000)}

댓글 반응:
${commentSample}

위 정보를 바탕으로 다음과 같이 작성해주세요:
1. 영상의 핵심 주제와 메시지를 2-3문장으로 요약
2. 주요 논점이나 특징적인 내용 언급
3. 시청자 반응의 특징이나 관심사 반영
총 3-4문장으로 전문적이고 매력적인 요약을 작성해주세요.`
      : `다음은 YouTube 영상의 정보입니다:
제목: "${videoInfo?.title || '제목 없음'}"
채널: ${videoInfo?.channelTitle || '알 수 없음'}
설명: ${videoInfo?.description?.slice(0, 500) || '설명 없음'}

댓글 반응:
${commentSample}

자막이 없어 제목, 설명, 댓글을 바탕으로 영상 내용을 추론하여 3-4문장의 매력적인 요약을 작성해주세요.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 YouTube 콘텐츠 분석 전문가입니다. 주어진 정보를 바탕으로 매력적이고 정확한 영상 요약을 작성합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    })
    
    if (!response.ok) {
      throw new Error('OpenAI API 호출 실패')
    }
    
    const data = await response.json()
    return data.choices[0].message.content.trim()
  } catch (error) {
    console.error('고급 요약 생성 오류:', error)
    return `"${videoInfo?.title || '영상'}"에 대한 분석입니다. ${videoInfo?.channelTitle || '제작자'}가 제작한 이 콘텐츠는 시청자들로부터 다양한 반응을 받고 있으며, 관련 주제에 대해 유용한 정보를 제공하고 있습니다.`
  }
}

// LLM을 활용한 고급 키워드 추출
async function extractAdvancedKeywords(transcript: string, comments: string[], videoTitle: string): Promise<string[]> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  
  if (!OPENAI_API_KEY) {
    // API가 없는 경우 기본 키워드 추출 사용
    const allText = `${videoTitle} ${transcript} ${comments.join(' ')}`
    return extractBasicKeywords(allText)
  }
  
  try {
    const commentSample = comments.slice(0, 30).join(' ')
    const contentSample = transcript ? transcript.slice(0, 1500) : videoTitle
    
    const prompt = `다음 YouTube 영상의 정보를 분석하여 핵심 키워드를 추출해주세요:

영상 제목: "${videoTitle}"

${transcript ? `영상 내용: ${contentSample}` : ''}

댓글 반응: ${commentSample}

위 내용을 바탕으로 다음 기준으로 8-10개의 핵심 키워드를 추출해주세요:
1. 영상의 주요 주제와 개념
2. 시청자들이 자주 언급하는 중요한 단어
3. 영상의 가치나 특징을 나타내는 용어
4. 검색이나 추천에 도움이 될 만한 키워드

키워드만 쉼표로 구분하여 나열해주세요. (예: 키워드1, 키워드2, 키워드3)`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 콘텐츠 분석 전문가입니다. 주어진 텍스트에서 가장 중요하고 의미있는 키워드를 추출합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    })
    
    if (!response.ok) {
      throw new Error('OpenAI API 호출 실패')
    }
    
    const data = await response.json()
    const keywordText = data.choices[0].message.content.trim()
    
         // 키워드 파싱 및 정리
     const keywords = keywordText
       .split(',')
       .map((keyword: string) => keyword.trim())
       .filter((keyword: string) => keyword.length > 0 && keyword.length < 20)
       .slice(0, 10)
    
    return keywords.length > 0 ? keywords : extractBasicKeywords(`${videoTitle} ${transcript} ${comments.join(' ')}`)
  } catch (error) {
    console.error('고급 키워드 추출 오류:', error)
    // 오류 시 기본 키워드 추출로 대체
    return extractBasicKeywords(`${videoTitle} ${transcript} ${comments.join(' ')}`)
  }
}

// 댓글 텍스트 정리 함수
function cleanCommentText(text: string): string {
  return text
    // HTML 태그 제거
    .replace(/<[^>]*>/g, '')
    // URL 제거
    .replace(/https?:\/\/[^\s]+/g, '')
    // 연속된 공백을 하나로
    .replace(/\s+/g, ' ')
    // 앞뒤 공백 제거
    .trim()
    // HTML 엔티티 디코딩
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
}

// 텍스트 언어 감지 및 번역 함수
async function translateToKorean(text: string): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  
  if (!OPENAI_API_KEY) {
    return text // API가 없으면 원문 반환
  }
  
  // 한국어 비율 확인 (간단한 휴리스틱)
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g
  const koreanMatches = text.match(koreanRegex) || []
  const koreanRatio = koreanMatches.length / text.length
  
  // 한국어 비율이 30% 이상이면 번역하지 않음
  if (koreanRatio > 0.3) {
    return text
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 번역가입니다. 주어진 텍스트를 자연스러운 한국어로 번역해주세요. 이미 한국어인 텍스트는 그대로 반환하세요.'
          },
          {
            role: 'user',
            content: `다음 텍스트를 한국어로 번역해주세요: "${text}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    })
    
    if (!response.ok) {
      return text
    }
    
    const data = await response.json()
    return data.choices[0].message.content.trim().replace(/^"(.*)"$/, '$1')
  } catch (error) {
    console.error('번역 오류:', error)
    return text
  }
}

// 고급 댓글 분석 함수
function analyzeCommentAdvanced(text: string) {
  // 감정 강도 분석
  const strongPositive = ['완전', '정말', '너무', '엄청', '대박', '최고', '사랑', '감동', '놀라운']
  const strongNegative = ['최악', '끔찍', '싫어', '짜증', '화나', '실망', '별로', '무서운']
  
  let intensityScore = 0
  strongPositive.forEach(word => {
    if (text.includes(word)) intensityScore += 1
  })
  strongNegative.forEach(word => {
    if (text.includes(word)) intensityScore -= 1
  })
  
  // 주제 분류
  const topics = {
    content: ['내용', '영상', '정보', '설명', '이야기', '주제'],
    technical: ['기술', '프로그래밍', '코딩', '개발', '알고리즘', '시스템'],
    educational: ['배움', '공부', '학습', '교육', '강의', '수업'],
    entertainment: ['재미', '웃음', '재밌', '즐거', '유머', '오락'],
    personal: ['경험', '생각', '의견', '느낌', '개인적', '저는']
  }
  
  const detectedTopics: string[] = []
  Object.entries(topics).forEach(([topic, keywords]) => {
    const hasKeyword = keywords.some(keyword => text.includes(keyword))
    if (hasKeyword) {
      detectedTopics.push(topic)
    }
  })
  
  // 질문 여부 확인
  const isQuestion = text.includes('?') || text.includes('궁금') || text.includes('어떻') || text.includes('뭐')
  
  // 길이 기반 분류
  const lengthCategory = text.length < 20 ? 'short' : text.length < 100 ? 'medium' : 'long'
  
  return {
    intensityScore,
    topics: detectedTopics,
    isQuestion,
    lengthCategory,
    engagement: intensityScore !== 0 || isQuestion ? 'high' : 'low'
  }
}

// 댓글 트렌드 분석 함수
function analyzeCommentTrends(comments: any[]) {
  const trends = {
    mostEngaged: comments.filter(c => c.analysis?.engagement === 'high').length,
    questionRatio: comments.filter(c => c.analysis?.isQuestion).length / comments.length,
    topicDistribution: {} as { [key: string]: number },
    sentimentIntensity: {
      veryPositive: comments.filter(c => c.analysis?.intensityScore > 0).length,
      veryNegative: comments.filter(c => c.analysis?.intensityScore < 0).length,
      neutral: comments.filter(c => c.analysis?.intensityScore === 0).length
    },
    lengthDistribution: {
      short: comments.filter(c => c.analysis?.lengthCategory === 'short').length,
      medium: comments.filter(c => c.analysis?.lengthCategory === 'medium').length,
      long: comments.filter(c => c.analysis?.lengthCategory === 'long').length
    }
  }
  
  // 주제 분포 계산
  comments.forEach(comment => {
    if (comment.analysis?.topics) {
      comment.analysis.topics.forEach((topic: string) => {
        trends.topicDistribution[topic] = (trends.topicDistribution[topic] || 0) + 1
      })
    }
  })
  
  return trends
}

// 대표 댓글 선별 함수
function selectRepresentativeComments(comments: any[], count: number = 3) {
  const sentimentGroups = {
    positive: comments.filter(c => c.sentiment === 'positive'),
    neutral: comments.filter(c => c.sentiment === 'neutral'),
    negative: comments.filter(c => c.sentiment === 'negative')
  }

  const representative: any = {}

  Object.entries(sentimentGroups).forEach(([sentiment, groupComments]) => {
    if (groupComments.length === 0) {
      representative[sentiment] = []
      return
    }

    // 댓글을 길이와 키워드 수를 기준으로 정렬하여 대표성 있는 댓글 선별
    const sortedComments = groupComments
      .filter(comment => comment.text.length >= 10 && comment.text.length <= 200)
      .sort((a, b) => {
        // 키워드가 많고 적당한 길이의 댓글을 우선
        const scoreA = a.keywords.length * 2 + (a.text.length > 30 ? 1 : 0)
        const scoreB = b.keywords.length * 2 + (b.text.length > 30 ? 1 : 0)
        return scoreB - scoreA
      })

    representative[sentiment] = sortedComments.slice(0, count)
  })

  return representative
}

// 기본 키워드 추출 함수 (백업용)
function extractBasicKeywords(text: string): string[] {
  const stopWords = [
    '의', '이', '가', '을', '를', '에', '에서', '와', '과', '로', '으로', '는', '은', '도', '만', 
    '부터', '까지', '한테', '께', '이다', '있다', '없다', '하다', '되다', '아니다', '같다',
    '그냥', '진짜', '정말', '너무', '매우', '조금', '많이', '좀', '아주', '완전', '엄청',
    '그리고', '그런데', '하지만', '그래서', '따라서', '그러면', '만약', '예를 들어',
    '영상', '댓글', '시청', '유튜브', '채널', '구독', '좋아요', '영상이', '정말로'
  ]
  
  // 특수문자 제거하고 단어 분리
  const words = text
    .replace(/[^\w\sㄱ-힣]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.includes(word))
    .map(word => word.toLowerCase())
  
  // 빈도 계산
  const frequency: { [key: string]: number } = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })
  
  // 빈도 순으로 정렬하여 상위 키워드 반환
  return Object.entries(frequency)
    .filter(([word, count]) => count >= 2 && word.length > 1)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word)
}

// 지속 시간 포맷팅 함수
function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 향상된 감정 분석 함수
// OpenAI를 사용한 배치 감정 분석 (성능 최적화)
async function analyzeSentimentBatch(texts: string[]): Promise<('positive' | 'neutral' | 'negative')[]> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  
  if (!OPENAI_API_KEY || texts.length === 0) {
    return texts.map(text => analyzeSentimentBasic(text))
  }
  
  try {
    // 배치 크기를 10개로 제한 (API 토큰 제한 고려)
    const batchSize = 10
    const results: ('positive' | 'neutral' | 'negative')[] = []
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      const batchPrompt = batch.map((text, idx) => `${idx + 1}. "${text}"`).join('\n')
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `당신은 한국어 댓글의 감정을 분석하는 전문가입니다. 여러 댓글을 한번에 분석해주세요.

감정 분류 기준:
- positive: 긍정적, 좋아함, 칭찬, 감사, 기쁨, 만족, 흥미, 응원 등
- negative: 부정적, 싫어함, 비판, 화남, 실망, 불만, 혐오, 슬픔 등  
- neutral: 중립적, 질문, 정보 공유, 단순 사실 진술, 애매한 감정 등

각 댓글에 대해 번호순으로 "positive", "negative", "neutral" 중 하나씩만 한 줄씩 응답하세요.
예시:
positive
negative
neutral`
            },
            {
              role: 'user',
              content: `다음 댓글들의 감정을 분석해주세요:\n${batchPrompt}`
            }
          ],
          max_tokens: 100,
          temperature: 0.1
        })
      })
      
      if (!response.ok) {
        throw new Error('OpenAI API 호출 실패')
      }
      
      const data = await response.json()
      const resultText = data.choices?.[0]?.message?.content?.trim()
      
      if (resultText && resultText.length > 0) {
        const lines = resultText.split('\n').filter((line: string) => line.trim().length > 0)
        const sentiments = lines.map((line: string) => {
          const sentiment = line.trim().toLowerCase()
          if (sentiment === 'positive' || sentiment === 'negative' || sentiment === 'neutral') {
            return sentiment as 'positive' | 'neutral' | 'negative'
          }
          // 부분 매칭 시도
          if (sentiment.includes('positive')) return 'positive' as const
          if (sentiment.includes('negative')) return 'negative' as const
          if (sentiment.includes('neutral')) return 'neutral' as const
          return 'neutral' as const // 기본값
        })
        
        // 올바른 개수만큼 결과 추가
        const validSentiments = sentiments.slice(0, batch.length)
        while (validSentiments.length < batch.length) {
          validSentiments.push('neutral')
        }
        results.push(...validSentiments)
      } else {
        // 실패시 기본 분석 사용
        console.warn(`OpenAI 배치 분석 응답이 비어있음, 기본 분석으로 대체`)
        results.push(...batch.map(text => analyzeSentimentBasic(text)))
      }
    }
    
    return results
  } catch (error) {
    console.error('AI 배치 감정 분석 오류:', error)
    return texts.map(text => analyzeSentimentBasic(text))
  }
}

// OpenAI를 사용한 개별 감정 분석
async function analyzeSentimentWithAI(text: string): Promise<'positive' | 'neutral' | 'negative'> {
  const results = await analyzeSentimentBatch([text])
  return results[0] || 'neutral'
}

// 기본 감정 분석 (백업용)
function analyzeSentimentBasic(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = [
    '좋', '최고', '대박', '완벽', '멋진', '훌륭', '감사', '사랑', '행복', '기쁨', 
    '놀라운', '환상적', '굉장', '멋져', '예뻐', '이쁘', '재밌', '웃겨', '유익',
    '도움', '고마워', '감동', '신기', '놀라', '최고예요', '좋아요', '짱', '킹', '갓',
    '흥미', '재미', '신남', '놀랍', '성공', '승리', '기대', '즐거', '행운', '축하'
  ]
  
  const negativeWords = [
    '나쁜', '최악', '싫어', '실망', '화나', '짜증', '별로', '지루', '무서운', '끔찍',
    '아쉽', '안좋', '못하', '틀렸', '구린', '이상', '문제', '싫다', '안됨', '별로다',
    '실패', '걱정', '우울', '슬프', '답답', '힘들', '어려', '불편', '불만', '비판'
  ]
  
  const neutralWords = [
    '그냥', '보통', '평범', '일반', '괜찮', '그럭저럭', '애매', '모르겠', '글쎄',
    '음', '어', '뭐', '그래', '아', '오', '이', '저', '그거', '그런데'
  ]
  
  const lowerText = text.toLowerCase()
  
  let positiveScore = 0
  let negativeScore = 0
  let neutralScore = 0
  
  positiveWords.forEach(word => {
    const count = (lowerText.match(new RegExp(word, 'g')) || []).length
    positiveScore += count
  })
  
  negativeWords.forEach(word => {
    const count = (lowerText.match(new RegExp(word, 'g')) || []).length
    negativeScore += count
  })
  
  neutralWords.forEach(word => {
    const count = (lowerText.match(new RegExp(word, 'g')) || []).length
    neutralScore += count * 0.5 // 중립 단어는 가중치 낮게
  })
  
  // 이모티콘 분석
  const positiveEmojis = /[😀😃😄😁😆😊😍🥰😘🤩🤗👍💕❤️🔥💯✨🎉]/g
  const negativeEmojis = /[😞😢😭😠😡🤬👎💔😰😱😤😒😔]/g
  
  positiveScore += (text.match(positiveEmojis) || []).length * 2
  negativeScore += (text.match(negativeEmojis) || []).length * 2
  
  // 감탄사나 반복 문자 고려
  if (/[!]{2,}/.test(text)) positiveScore += 1
  if (/[?]{2,}/.test(text)) neutralScore += 1
  if (/ㅠㅠ|ㅜㅜ|ㅡㅡ/.test(text)) negativeScore += 1
  if (/ㅋㅋ|ㅎㅎ|ㅇㅇ/.test(text)) positiveScore += 0.5
  
  if (positiveScore > negativeScore && positiveScore > neutralScore) return 'positive'
  if (negativeScore > positiveScore && negativeScore > neutralScore) return 'negative'
  return 'neutral'
}

// 기존 함수명과의 호환성을 위한 래퍼 함수
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  return analyzeSentimentBasic(text)
}

// YouTube API를 사용한 텍스트 요약 (OpenAI API 사용) - 기존 함수 유지
async function generateSummary(transcript: string, videoInfo: any): Promise<string> {
  // 새로운 고급 요약 함수로 리다이렉트
  return generateAdvancedSummary(transcript, videoInfo, [])
}

// 유튜브 URL에서 비디오 ID 추출
function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// 모의 댓글 데이터 (API 실패시 대체용)
function getMockComments(videoId: string): Array<{ text: string; author: string }> {
  return [
    { text: "정말 유익한 영상이네요! 많이 배웠습니다.", author: "viewer1" },
    { text: "설명이 너무 좋아요. 이해하기 쉽게 설명해주셔서 감사합니다.", author: "viewer2" },
    { text: "이런 내용 더 많이 올려주세요", author: "viewer3" },
    { text: "음... 조금 아쉬운 부분이 있네요", author: "viewer4" },
    { text: "와 정말 대박이네요! 최고입니다", author: "viewer5" },
    { text: "이해가 잘 안되는 부분이 있어요", author: "viewer6" },
    { text: "다음 영상도 기대됩니다!", author: "viewer7" },
    { text: "좋은 정보 공유해주셔서 감사해요", author: "viewer8" },
    { text: "조금 더 자세한 설명이 있으면 좋겠어요", author: "viewer9" },
    { text: "완전 꿀팁이네요 ㅎㅎ", author: "viewer10" }
  ]
}

export async function POST(request: NextRequest) {
  try {
    const { url, commentLimit = 100 } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL이 필요합니다.' },
        { status: 400 }
      )
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json(
        { error: '올바른 YouTube URL이 아닙니다.' },
        { status: 400 }
      )
    }

    console.log(`영상 분석 시작: ${videoId}, 댓글 개수: ${commentLimit === -1 ? '모든 댓글' : `${commentLimit}개`}`)

    // 병렬로 데이터 수집
    const [videoInfo, transcript, rawComments] = await Promise.all([
      getYouTubeVideoInfo(videoId),
      getYouTubeSubtitles(videoId),
      getYouTubeComments(videoId, commentLimit)
    ])

    // 기본 비디오 정보 설정 (API 실패시 대체)
    const finalVideoInfo = videoInfo || {
      title: "YouTube 영상 분석",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: "알 수 없음",
      views: "조회수 정보 없음",
      description: "",
      channelTitle: "알 수 없음"
    }

    // 댓글 텍스트 추출 (LLM 분석용)
    const commentTexts = rawComments.map(comment => comment.text)

    // 고급 요약 및 키워드 생성 (병렬 처리)
    const [summary, topKeywords] = await Promise.all([
      generateAdvancedSummary(transcript, finalVideoInfo, commentTexts),
      extractAdvancedKeywords(transcript, commentTexts, finalVideoInfo.title)
    ])

    // 댓글 전처리 및 번역
    const preprocessedComments = await Promise.all(
      rawComments.map(async (comment) => {
        const cleanText = cleanCommentText(comment.text)
        if (cleanText.length <= 5) return null // 너무 짧은 댓글 제외
        
        const translatedText = await translateToKorean(cleanText)
        return {
          originalText: cleanText !== translatedText ? cleanText : undefined,
          translatedText,
          author: comment.author
        }
      })
    )
    
    const validComments = preprocessedComments.filter(Boolean) as any[]
    
    // 배치로 감정 분석 수행 (성능 최적화)
    const translatedTexts = validComments.map(c => c.translatedText)
    const sentiments = await analyzeSentimentBatch(translatedTexts)
    
    // 최종 댓글 처리
    const processedComments = validComments.map((comment, index) => {
      const analysis = analyzeCommentAdvanced(comment.translatedText)
      
      return {
        text: comment.translatedText,
        originalText: comment.originalText,
        sentiment: sentiments[index] || 'neutral',
        keywords: extractBasicKeywords(comment.translatedText),
        author: comment.author,
        analysis
      }
    })
    
    const comments = processedComments.filter(Boolean) as any[] // null 제거

    // 감정 분포 계산
    const sentimentCounts = comments.reduce(
      (acc, comment) => {
        acc[comment.sentiment]++
        return acc
      },
      { positive: 0, neutral: 0, negative: 0 }
    )

    const total = comments.length || 1
    const sentimentDistribution = {
      positive: Math.round((sentimentCounts.positive / total) * 100),
      neutral: Math.round((sentimentCounts.neutral / total) * 100),
      negative: Math.round((sentimentCounts.negative / total) * 100)
    }

    // 대표 댓글 선별 (각 감정별로 3개씩)
    const representativeComments = selectRepresentativeComments(comments, 3)
    
    // 댓글 트렌드 분석
    const trends = analyzeCommentTrends(comments)

    const response = {
      summary,
      videoInfo: finalVideoInfo,
      comments: comments.slice(0, 50), // 최대 50개 댓글만 반환 (기존 호환성 유지)
      representativeComments, // 새로운 대표 댓글 필드
      trends, // 댓글 트렌드 분석 결과
      visual: {
        sentimentDistribution,
        topKeywords
      },
      metadata: {
        totalComments: comments.length,
        hasTranscript: transcript.length > 0,
        dataSource: videoInfo ? 'youtube_api' : 'fallback',
        commentLimit: commentLimit === -1 ? 'all' : commentLimit,
        translationApplied: comments.some(c => c.originalText !== undefined)
      }
    }

    console.log(`분석 완료: ${comments.length}개 댓글, 자막 ${transcript.length > 0 ? '있음' : '없음'}`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : '알 수 없는 오류') },
      { status: 500 }
    )
  }
} 