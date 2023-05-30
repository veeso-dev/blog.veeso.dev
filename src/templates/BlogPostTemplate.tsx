import { MDXProvider } from "@mdx-js/react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import styled from "styled-components";
import { getImage } from "gatsby-plugin-image";
import React from "react";

import { PageLayout } from "../components/PageLayout";
import { CustomHead } from "../components/CustomHead";
import { components, MainContent } from "../components/mdx-components";
import ShareButtons from "../components/ShareButtons";
import { readingTime } from "../utils/utils";

const Metadata = styled.div`
  span {
    color: #888;
    padding-right: 8px;
  }
`;

const Body = styled.div`
  padding: 24px 0;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  justify-content: center;
`;

const Button = styled.button`
  border-radius: 8px;
  border: 0;
  font-size: 1.2em;
  margin: 16px 0;
  padding: 16px;

  a {
    color: #444;
    text-decoration: none;
  }

  :hover {
    background-color: #ddd;
  }
`;

const BlogPostTemplate: React.FC<PageProps<Queries.BlogPostQuery>> = ({
  data,
  children,
}) => {
  const url = typeof window !== "undefined" ? window.location.href : "";
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
        <Metadata>
          <span>{data.mdx?.frontmatter?.date}</span>
          <span>—</span>
          <span>{readingTime(data.mdx?.body ?? "")} min read</span>
        </Metadata>
        <Body>
          <MDXProvider components={components}>{children}</MDXProvider>
        </Body>
        <Footer>
          <Buttons>
            <Button>
              <Link to={"/blog"}>Discover more</Link>
            </Button>
          </Buttons>
          <ShareButtons
            url={url}
            author={data.mdx?.frontmatter?.author ?? ""}
            title={data.mdx?.frontmatter?.title ?? ""}
            description={data.mdx?.excerpt ?? ""}
          />
        </Footer>
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
      title={data.mdx?.frontmatter?.title || ""}
      description={data.mdx?.excerpt || ""}
      image={imageUrl}
      article
    />
  );
};
