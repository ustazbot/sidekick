/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/api/download': ['./vault/**/*', './public/vault/vault_index.json'],
    '/api/search':   ['./public/vault/vault_index.json'],
  },
}

export default nextConfig
