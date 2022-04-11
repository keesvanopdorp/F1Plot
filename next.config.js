/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  compress: true,
  devIndicators: process.env.NODE_ENV !== 'production' ? true : false,
}
