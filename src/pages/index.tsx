import * as React from "react";
import styled from "styled-components";
import "../styles/global.css";
import { graphql, HeadFC, PageProps } from "gatsby";

import { PageLayout } from "../components/PageLayout";
import PostLink from "../components/PostLink";
import { getImage } from "gatsby-plugin-image";
import Heading from "../design/Heading";
import Bio from "../components/Bio";

const LatestPosts = styled.div`
  column-gap: 8px;
  display: grid;
  grid-template-columns: 50% 50%;

  @media screen and (max-width: 640px) {
    grid-template-columns: 100%;
  }
`;

const IndexPage: React.FC<PageProps> = ({
  data: {
    allMdx: { nodes },
  },
}) => {
  const posts = nodes
    .sort((a, b) => (a.frontmatter.date > b.frontmatter.date ? -1 : 1))
    .slice(0, 4)
    .map((node) => (
      <PostLink
        key={node.id}
        className="animate__animated animate__fadeIn animate__slow"
        link={`/blog/${node.frontmatter?.slug}`}
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
        <Heading.H1>Latest Posts</Heading.H1>
        <LatestPosts>{posts}</LatestPosts>
      </div>
    </PageLayout>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Christian Visintin Blog</title>;

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
        }
        internal {
          contentFilePath
        }
      }
    }
  }
`;
