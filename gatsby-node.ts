import { CreatePagesArgs } from "gatsby";
import path from "path";

exports.createPages = async ({
  graphql,
  actions,
  reporter,
}: CreatePagesArgs) => {
  const { createPage } = actions;

  const BlogPostTemplate = path.resolve("./src/templates/BlogPostTemplate.tsx");

  const result = await graphql<Queries.GatsbyNodeCreatePagesQuery>(
    `
      query GatsbyNodeCreatePages {
        allMdx {
          nodes {
            id
            frontmatter {
              slug
            }
            internal {
              contentFilePath
            }
          }
        }
      }
    `
  );

  if (result.errors) {
    reporter.panicOnBuild(
      "There was an error loading the MDX result",
      result.errors
    );
  }

  result.data?.allMdx.nodes.forEach((node) => {
    createPage({
      path: `/blog/${node.frontmatter?.slug}`,
      component: `${BlogPostTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      context: { id: node.id },
    });
  });
};
