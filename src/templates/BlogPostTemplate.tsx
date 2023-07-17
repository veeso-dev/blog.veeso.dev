import { MDXProvider } from '@mdx-js/react';
import { graphql, HeadFC, Link, PageProps } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';
import React from 'react';

import { PageLayout } from '../components/PageLayout';
import { CustomHead } from '../components/CustomHead';
import { components, MainContent } from '../components/mdx-components';
import ShareButtons from '../components/ShareButtons';
import { readingTime } from '../utils/utils';
import Container from '../components/shared/Container';
import Button from '../components/shared/Button';

const BlogPostTemplate: React.FC<PageProps<Queries.BlogPostQuery>> = ({
  data,
  children,
}) => {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const featuredImage = data.mdx?.frontmatter?.featuredImage
    ? getImage(data.mdx.frontmatter.featuredImage.childImageSharp)
    : null;

  return (
    <PageLayout
      image={featuredImage}
      title={data.mdx?.frontmatter?.title ?? undefined}
      subtitle={data.mdx?.frontmatter?.subtitle ?? undefined}
    >
      <MainContent>
        <Container.Container>
          <span className="text-gray-400 dark:text-gray-300 pr-2">
            {data.mdx?.frontmatter?.date}
          </span>
          <span className="text-gray-400 dark:text-gray-300 pr-2">—</span>
          <span className="text-gray-400 dark:text-gray-300 pr-2">
            {readingTime(data.mdx?.body ?? '')} min read
          </span>
        </Container.Container>
        <Container.Container className="py-4">
          <MDXProvider components={components}>{children}</MDXProvider>
        </Container.Container>
        <Container.FlexRow className="justify-between">
          <Container.FlexRow className="items-center justify-center">
            <Link
              className="font-medium text-lg text-brand dark:text-gray-300 underline hover:no-underline"
              to={'/blog'}
            >
              Discover more
            </Link>
          </Container.FlexRow>
          <ShareButtons
            url={url}
            author={data.mdx?.frontmatter?.author ?? ''}
            title={data.mdx?.frontmatter?.title ?? ''}
            description={data.mdx?.excerpt ?? ''}
          />
        </Container.FlexRow>
      </MainContent>
    </PageLayout>
  );
};

export default BlogPostTemplate;

export const query = graphql`
  query BlogPost($id: String!) {
    mdx(id: { eq: $id }) {
      excerpt(pruneLength: 160)
      body
      frontmatter {
        title
        author
        subtitle
        date(formatString: "MMMM DD, YYYY")
        featuredImage {
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH)
          }
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
      article
    />
  );
};
