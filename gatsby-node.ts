import { CreatePagesArgs } from 'gatsby';
import { copyLibFiles } from '@builder.io/partytown/utils';
import path from 'path';
import { getPostRoute } from './src/utils/route';

exports.onPreBuild = async () => {
  await copyLibFiles(path.join(__dirname, 'static', '~partytown'));
};

exports.createPages = async ({
  graphql,
  actions,
  reporter,
}: CreatePagesArgs) => {
  const { createPage } = actions;

  const BlogPostTemplate = path.resolve('./src/templates/BlogPostTemplate.tsx');

  const result = await graphql<Queries.GatsbyNodeCreatePagesQuery>(`
    query GatsbyNodeCreatePages {
      allMdx {
        nodes {
          id
          frontmatter {
            slug
            lang
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild(
      'There was an error loading the MDX result',
      result.errors,
    );
  }

  result.data?.allMdx.nodes.forEach((node) => {
    if (node.frontmatter?.lang && node.frontmatter?.slug) {
      createPage({
        path: getPostRoute(node.frontmatter?.lang, node.frontmatter?.slug),
        component: `${BlogPostTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
        context: { id: node.id, lang: node.frontmatter?.lang },
      });
    }
  });
};
