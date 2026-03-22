import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://money-together.vercel.app'
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/api/og'],
            disallow: ['/dashboard', '/history', '/stats', '/profile', '/add', '/login', '/onboarding'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
