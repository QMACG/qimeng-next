// import { fileURLToPath } from 'url'
import { env } from './validations/dotenv-check'
import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
// import remarkGfm from 'remark-gfm'
// import rehypeSlug from 'rehype-slug'
// import rehypeAutolinkHeadings from 'rehype-autolink-headings'
// import rehypePrettyCode from 'rehype-pretty-code'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

const isWindows = process.platform === 'win32'
const toAllowedOriginHost = (value?: string) => {
  if (!value) {
    return null
  }

  try {
    return new URL(value).host
  } catch {
    return null
  }
}

const serverActionAllowedOrigins = Array.from(
  new Set(
    [
      env.data?.KUN_VISUAL_NOVEL_SITE_URL,
      ...(env.data?.KUN_VISUAL_NOVEL_SITE_URLS
        ? env.data.KUN_VISUAL_NOVEL_SITE_URLS.split(',')
        : []),
      env.data?.NEXT_PUBLIC_KUN_PATCH_ADDRESS_PROD,
      env.data?.NEXT_PUBLIC_KUN_PATCH_ADDRESS_DEV
    ]
      .map((item) => toAllowedOriginHost(item?.trim()))
      .filter((item): item is string => Boolean(item))
  )
)

const nextConfig: NextConfig = {
  devIndicators: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  transpilePackages: ['next-mdx-remote'],
  publicRuntimeConfig: {
    NODE_ENV: env.data!.NODE_ENV
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: true
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**'
      }
    ]
  },

  ...(isWindows ? {} : { output: 'standalone' }),
  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins
    }
    // turbotrace: {
    //   logLevel: 'error',
    //   logDetail: false,
    //   contextDirectory: path.join(__dirname, '/'),
    //   memoryLimit: 1024
    // }
  }
}

// Turbopack compatible errors
const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    // remarkPlugins: [remarkGfm],
    rehypePlugins: [
      // rehypeSlug,
      // [
      //   rehype - autolink - headings,
      //   {
      //     properties: {
      //       className: ['anchor'],
      //     },
      //   },
      // ],
      // [
      //   rehypePrettyCode,
      //   {
      //     theme: 'github-dark',
      //   },
      // ],
    ]
  }
})

export default withMDX(nextConfig)
