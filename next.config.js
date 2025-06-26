/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  env: {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
}

module.exports = nextConfig 