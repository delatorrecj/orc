export default function SchemaData() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "SoftwareApplication",
                "name": "ORC",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "500",
                    "priceCurrency": "USD",
                    "description": "Startup Tier Subscription"
                },
                "featureList": [
                    "Touchless Intake",
                    "AI-Powered Document Extraction",
                    "Compliance Validation (The Guardian)",
                    "ERP Integration"
                ],
                "description": "The first 'Glass Box' AI for supply chain intake. Decouple growth from headcount with autonomous document orchestration.",
                "brand": {
                    "@type": "Brand",
                    "name": "ORC",
                    "slogan": "Your Supply Chain. Orchestrated.",
                    "logo": "https://orc.ai/orc.png"
                }
            },
            {
                "@type": "Organization",
                "name": "ORC",
                "url": "https://orc.ai",
                "logo": "https://orc.ai/orc.png",
                "sameAs": [
                    "https://cloud.google.com/marketplace"
                ],
                "description": "Provider of the ORC Supply Chain Orchestration Platform.",
                "knowsAbout": ["Supply Chain", "Generative AI", "Compliance", "ERP Integration"]
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
