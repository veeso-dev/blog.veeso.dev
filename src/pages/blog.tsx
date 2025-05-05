import * as React from 'react';
import '../styles/global.css';
import { graphql, HeadFC, PageProps } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';

import { PageLayout } from '../components/PageLayout';
import PostLink from '../components/PostLink';
import Heading from '../components/reusable/Heading';
import Container from '../components/reusable/Container';
import { getPostRoute } from '../utils/route';
import { getNavigatorLanguage } from '../utils/locale';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { CustomHead } from '../components/CustomHead';

const Blog: React.FC<PageProps> = ({
  data: {
    allMdx: { nodes },
  },
}) => {
  const currentLanguage = getNavigatorLanguage();
  const posts = nodes
    .sort((a, b) => (a.frontmatter.date > b.frontmatter.date ? -1 : 1))
    .filter(
      (node) =>
        node.frontmatter.lang === currentLanguage &&
        node.frontmatter.draft !== true,
    )
    .map((node) => (
      <PostLink
        key={node.slug}
        link={getPostRoute(currentLanguage, node.frontmatter?.slug)}
        title={node.frontmatter.title}
        excerpt={node.excerpt}
        body={node.body}
        date={node.frontmatter.date}
        subtitle={node.frontmatter.subtitle}
        image={
          node.frontmatter?.featuredImage
            ? getImage(node.frontmatter?.featuredImage.childImageSharp)
            : undefined
        }
      />
    ));

  return (
    <PageLayout>
      <Heading.H1>Blog Posts</Heading.H1>
      <Container.Container className="grid grid-cols-2 sm:grid-cols-1 items-start justify-start gap-4">
        {posts}
      </Container.Container>
    </PageLayout>
  );
};

export default Blog;

export const Head: HeadFC = () => {
  const metadata = useSiteMetadata();
  const title = metadata.title ?? undefined;
  const description = metadata.description ?? undefined;

  return (
    <CustomHead
      title={title}
      description={description}
      lang={getNavigatorLanguage()}
    />
  );
};

export const pageQuery = graphql`
  query {
    allMdx {
      nodes {
        id
        excerpt(pruneLength: 256)
        body
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
        }
        internal {
          contentFilePath
        }
      }
    }
  }
`;
