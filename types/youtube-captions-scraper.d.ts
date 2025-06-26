declare module 'youtube-captions-scraper' {
  export function getSubtitles(options: {
    videoID: string
    lang?: string
  }): Promise<Array<{ start: string; dur: string; text: string }>>
} 