import React from 'react';
import { useEffect } from 'react';

const SEO = ({
  title = "Flores Dog Training - Professional Dog Training Services",
  description = "Expert dog training services with personalized programs. Transform your dog's behavior with proven techniques from certified trainers.",
  keywords = "dog training, puppy training, dog behavior, obedience training, professional dog trainer",
  image = "/puppy.png",
  url = window.location.href,
  type = "website",
  robots = "index, follow",
  canonical,
  structuredData
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Update or create link tags
    const updateLinkTag = (rel, href) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', robots);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Flores Dog Training', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Canonical URL
    if (canonical) {
      updateLinkTag('canonical', canonical);
    }

    // Structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      // Note: We don't clean up meta tags on unmount as they should persist
      // until another SEO component updates them
    };
  }, [title, description, keywords, image, url, type, robots, canonical, structuredData]);

  return null; // This component doesn't render anything
};

export default SEO;