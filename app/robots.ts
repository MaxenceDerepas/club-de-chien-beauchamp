import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://club-de-chien-beauchamp.vercel.app";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/membre", "/login", "/api"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
