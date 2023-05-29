import { MDXProvider } from "@mdx-js/react";
import { graphql, HeadFC, PageProps } from "gatsby";
import { getImage } from "gatsby-plugin-image";
import React from "react";
import { PageLayout } from "../components/PageLayout";
import { CustomHead } from "../components/CustomHead";
import { components, MainContent } from "../components/mdx-components";
import ShareButtons from "../components/ShareButtons";

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
    >
      <MainContent>
        <div>
          <span>
            By {data.mdx?.frontmatter?.author} on {data.mdx?.frontmatter?.date}
          </span>
        </div>
        <MDXProvider components={components}>{children}</MDXProvider>
        <ShareButtons
          url={url}
          author={data.mdx?.frontmatter?.author ?? ""}
          title={data.mdx?.frontmatter?.title ?? ""}
          description={data.mdx?.excerpt ?? ""}
        />
      </MainContent>
    </PageLayout>
  );
};

export default BlogPostTemplate;

export const query = graphql`
  query BlogPost($id: String!) {
    mdx(id: { eq: $id }) {
      excerpt(pruneLength: 159)
      frontmatter {
        title
        author
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
