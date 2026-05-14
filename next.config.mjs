/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/download': ['./vault/**/*'],
    '/api/search':   ['./public/vault/vault_index.json'],
  },
}

export default nextConfig
