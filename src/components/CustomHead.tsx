import { useLocation } from '@reach/router';
import React from 'react';
import { useSiteMetadata } from '../hooks/use-site-metadata';

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
  author: propAuthor,
  noindex = false,
  children,
}) => {
  const {
    title: siteTitle,
    description: siteDescription,
    image: siteImage,
    siteUrl,
    author: siteAuthor,
  } = useSiteMetadata();

  const { pathname } = useLocation();
  const defaultCanonicalPath = `${siteUrl}${pathname}`;
  const title = propTitle;
  const description = propDescription || siteDescription || '';
  const canonicalUrl = propCanonicalPath || defaultCanonicalPath;
  const siteName = siteTitle || 'MachineServant';
  const lang = propLang || 'en_US';
  const author = propAuthor || siteAuthor || '';

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
      <meta name="twitter:creator" content={author} />
      <meta name="twitter:site" content={author} />
      <meta name="tiwtter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? (
        <>
          <meta property="og:image" content={`${siteUrl}${image}`} />
          <meta name="twitter:card" content="summary_large_image" />
        </>
      ) : (
        <>
          <meta property="og:image" content={`${siteUrl}/${siteImage}`} />
          <meta name="twitter:card" content="summary" />
        </>
      )}
      {noindex && <meta name="googlebot" content="noindex, nofollow" />}
      {children}
    </>
  );
};
