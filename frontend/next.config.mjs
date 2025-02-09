/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true
  },
  compiler: {
    styledComponents: true
  }
}

export default nextConfig 