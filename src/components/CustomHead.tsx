import { useLocation } from '@reach/router';
import React from 'react';
import { useSiteMetadata } from '../hooks/use-site-metadata';

const TWITTER_HANDLE = '@veso_dev';

interface CustomHeadProps {
  description?: string;
  lang?: string;
  title?: string;
  image?: string;
  article?: boolean;
  canonicalUrl?: string;
  nonCanonical?: boolean;
  author?: string;
  noindex?: boolean;
}

export const CustomHead: React.FC<React.PropsWithChildren<CustomHeadProps>> = ({
  description: propDescription,
  lang: propLang,
  title: propTitle,
  image,
  article,
  canonicalUrl: propCanonicalPath,
  nonCanonical = false,
  noindex = false,
  children,
}) => {
  const {
    title: siteTitle,
    description: siteDescription,
    siteUrl,
  } = useSiteMetadata();

  const { pathname } = useLocation();
  const defaultCanonicalPath = `${siteUrl}${pathname}`;
  const title = propTitle;
  const description = propDescription || siteDescription || '';
  const canonicalUrl = propCanonicalPath || defaultCanonicalPath;
  const siteName = siteTitle || 'MachineServant';
  const lang = propLang || 'en_US';

  return (
    <>
      <html lang={lang} />
      <title>{title}</title>
      {!nonCanonical && <link rel="canonical" href={canonicalUrl} />}
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={lang} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />-
      <meta name="tiwtter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && (
        <>
          <meta property="og:image" content={`${siteUrl}${image}`} />
          <meta name="twitter:card" content="summary_large_image" />
        </>
      )}
      {noindex && <meta name="googlebot" content="noindex, nofollow" />}
      {children}
    </>
  );
};
