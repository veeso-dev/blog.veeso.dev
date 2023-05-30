import * as React from "react";
import styled from "styled-components";
import "../styles/global.css";
import { graphql, HeadFC, PageProps } from "gatsby";
import { getImage } from "gatsby-plugin-image";

import { PageLayout } from "../components/PageLayout";
import PostLink from "../components/PostLink";
import Heading from "../design/Heading";

const PostList = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: start;
  padding: 24px;
`;

const Blog: React.FC<PageProps> = ({
  data: {
    allMdx: { nodes },
  },
}) => {
  const posts = nodes.map((node) => (
    <PostLink
      key={node.slug}
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
      <Heading.H1>Blog Posts</Heading.H1>
      <PostList>{posts}</PostList>
    </PageLayout>
  );
};

export default Blog;

export const Head: HeadFC = () => <title>Blog</title>;

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
          date(formatString: "MMMM DD, YYYY")
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
