import * as React from 'react';
import '../styles/global.css';
import { graphql, HeadFC, PageProps } from 'gatsby';

import { PageLayout } from '../components/PageLayout';
import PostLink from '../components/PostLink';
import { getImage } from 'gatsby-plugin-image';
import Heading from '../components/reusable/Heading';
import Bio from '../components/Bio';
import Container from '../components/reusable/Container';
import { getPostRoute } from '../utils/route';
import { getNavigatorLanguage } from '../utils/locale';
import RichTextFormattedMessage from '../components/reusable/RichTextFormattedMessage';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { CustomHead } from '../components/CustomHead';

const IndexPage: React.FC<PageProps> = ({
  data: {
    allMdx: { nodes },
  },
}) => {
  const currentLanguage = getNavigatorLanguage();
  const posts = nodes
    .sort((a, b) => (a.frontmatter.date > b.frontmatter.date ? -1 : 1))
    .filter((node) => node.frontmatter.lang === currentLanguage)
    .slice(0, 4)
    .map((node) => (
      <PostLink
        key={node.id}
        className="animate__animated animate__fadeIn animate__slow"
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
      <Bio />
      <div>
        <Heading.H1>
          <RichTextFormattedMessage id={'home.latestPosts'} />
        </Heading.H1>
        <Container.Container className="grid grid-cols-2 gap-x-4 sm:grid-cols-1">
          {posts}
        </Container.Container>
      </div>
    </PageLayout>
  );
};

export default IndexPage;

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
        excerpt(pruneLength: 128)
        body
        frontmatter {
          slug
          title
          subtitle
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
