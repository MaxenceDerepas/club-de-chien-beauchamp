import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.clubcaninbeauchamp.fr";

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
