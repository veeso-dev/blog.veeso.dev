import { MDXProvider } from '@mdx-js/react';
import { graphql, HeadFC, Link, PageProps } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';
import React from 'react';
import '../styles/global.css';

import { PageLayout } from '../components/PageLayout';
import { CustomHead } from '../components/CustomHead';
import { components, MainContent } from '../components/mdx-components';
import ShareButtons from '../components/ShareButtons';
import { isThemeLight, readingTime } from '../utils/utils';
import Container from '../components/reusable/Container';
import RichTextFormattedMessage from '../components/reusable/RichTextFormattedMessage';
import RLink from '../components/reusable/Link';
import X from '../components/reusable/svg/Mastodon';
import { FormattedDate } from 'react-intl';
import RelatedPosts from '../components/RelatedPosts';

const getRelatedPosts = (
  data: any,
  id: string,
  lang: string,
  tag: string,
): any[] => {
  const related = data.relatedPosts.nodes.filter(
    (item: any) =>
      item.id !== id &&
      item.frontmatter.lang === lang &&
      item.frontmatter.tag === tag,
  );

  return related.sort(() => Math.random() - 0.5).slice(0, 2);
};

const BlogPostTemplate: React.FC<PageProps<Queries.BlogPostQuery>> = ({
  data,
  children,
}) => {
  const [relatedPosts, setRelatedPosts] = React.useState<any[]>([]);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const featuredImage = data.mdx?.frontmatter?.featuredImage
    ? getImage(data.mdx.frontmatter.featuredImage.childImageSharp)
    : null;
  const fill = isThemeLight() ? '#31363b' : '#fff';

  const id = data.mdx?.id ?? '';
  const lang = data.mdx?.frontmatter?.lang ?? 'en';
  const tag = data.mdx?.frontmatter?.tag ?? undefined;

  React.useEffect(() => {
    if (tag) {
      const related = getRelatedPosts(data, id, lang, tag);
      setRelatedPosts(related);
    }
  }, [lang, tag]);

  return (
    <PageLayout
      image={featuredImage}
      title={data.mdx?.frontmatter?.title ?? undefined}
      subtitle={data.mdx?.frontmatter?.subtitle ?? undefined}
      beforeFooter={relatedPosts && <RelatedPosts posts={relatedPosts} />}
    >
      <MainContent>
        <Container.FlexResponsiveRow className="items-center justify-between">
          <Container.Container>
            {data.mdx?.frontmatter?.date && (
              <span className="text-gray-400 dark:text-gray-300 pr-2">
                <FormattedDate
                  year="numeric"
                  month="long"
                  day="2-digit"
                  value={data.mdx?.frontmatter?.date}
                />
              </span>
            )}
            <span className="text-gray-400 dark:text-gray-300 pr-2">—</span>
            <span className="text-gray-400 dark:text-gray-300 pr-2">
              {readingTime(data.mdx?.body ?? '')}{' '}
              <RichTextFormattedMessage id={'post.readingTime'} />
            </span>
          </Container.Container>
          <ShareButtons
            url={url}
            author={data.mdx?.frontmatter?.author ?? ''}
            title={data.mdx?.frontmatter?.title ?? ''}
            description={data.mdx?.excerpt ?? ''}
          />
        </Container.FlexResponsiveRow>
        <Container.Container className="py-4">
          <MDXProvider components={components}>{children}</MDXProvider>
        </Container.Container>
        <Container.FlexCols>
          <Container.FlexResponsiveRow className="justify-between items-center my-10 sm:gap-8">
            <Container.FlexResponsiveRow className="items-center justify-center gap-8">
              <Link
                className="font-medium text-lg text-brand dark:text-gray-300 underline hover:no-underline"
                to={'/blog'}
              >
                <RichTextFormattedMessage id={'post.discoverMore'} />
              </Link>
              <RLink.Paragraph href={'https://x.com/veeso_dev'} target="_blank">
                <X className="mr-2 inline" fill={fill} />
                Follow me on X.com
              </RLink.Paragraph>
            </Container.FlexResponsiveRow>
            <ShareButtons
              url={url}
              author={data.mdx?.frontmatter?.author ?? ''}
              title={data.mdx?.frontmatter?.title ?? ''}
              description={data.mdx?.excerpt ?? ''}
            />
          </Container.FlexResponsiveRow>
        </Container.FlexCols>
      </MainContent>
    </PageLayout>
  );
};

export default BlogPostTemplate;

export const query = graphql`
  query BlogPost($id: String!) {
    mdx(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      body
      frontmatter {
        title
        author
        subtitle
        date(formatString: "MMMM DD, YYYY")
        lang
        tag
        featuredImage {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH)
          }
        }
      }
    }

    relatedPosts: allMdx {
      nodes {
        id
        excerpt(pruneLength: 128)
        frontmatter {
          slug
          title
          subtitle
          draft
          date(formatString: "YYYY-MM-DD")
          featuredImage {
            childImageSharp {
              gatsbyImageData(layout: CONSTRAINED)
            }
          }
          lang
          tag
        }
      }
    }
  }
`;

export const Head: HeadFC<Queries.BlogPostQuery, unknown> = ({ data }) => {
  const imageUrl =
    data.mdx?.frontmatter?.featuredImage?.childImageSharp?.gatsbyImageData
      .images.fallback?.src;

  return (
    <CustomHead
      title={data.mdx?.frontmatter?.title || ''}
      description={data.mdx?.excerpt || ''}
      image={imageUrl}
      lang={data.mdx?.frontmatter?.lang || 'en'}
      article
    />
  );
};
