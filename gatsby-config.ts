import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Christian Visintin | Blog`,
    description: `I'm a dev and rustacean writing about my dev misadventures and give unneeded opinions on many topics involving technology and development`,
    author: 'Christian Visintin',
    siteUrl: `https://blog.veeso.dev`,
    navigation: [
      {
        name: 'Blog',
        path: '/blog',
      },
    ],
    languages: ['en', 'it'],
  },
  graphqlTypegen: true,
  plugins: [
    'gatsby-plugin-postcss',
    'gatsby-plugin-image',
    'gatsby-remark-images',
    'gatsby-remark-copy-linked-files',
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        filterPages: ({ path }) => {
          return (
            !path.endsWith('.md') &&
            !path.endsWith('.mdx') &&
            !path.endsWith('index-it/') &&
            !path.endsWith('index-en/') &&
            !path.endsWith('index.it') &&
            !path.endsWith('index.en')
          );
        },
        serialize: ({ path }) => {
          // Estrai la lingua dal percorso della pagina
          const lang = path.split('/')[2];
          if (lang) {
            return {
              url: `https://blog.veeso.dev${path}`,
              priority: 0.7,
              links: [{ lang, url: `https://blog.veeso.dev${path}` }],
            };
          } else {
            return {
              url: `https://blog.veeso.dev${path}`,
              priority: 0.7,
            };
          }
        },
      },
    },
    {
      resolve: 'gatsby-plugin-i18n',
      options: {
        langKeyDefault: 'en',
        useLangKeyLayout: false,
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'src/images/favicon-96x96.png',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: './src/images/',
      },
      __key: 'images',
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: './src/pages/',
      },
      __key: 'pages',
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: './src/blog/',
      },
      __key: 'blog',
    },
    {
      options: {
        path: `${__dirname}/src/blog`,
      },
      resolve: 'gatsby-plugin-page-creator',
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        // your google analytics tracking id
        trackingIds: ['G-P1G1JW9N1R'],
        gtagConfig: {
          anonymize_ip: true,
          cookie_expires: 86400 * 7,
        },
        pluginConfig: {
          // Puts tracking script in the head instead of the body
          head: false,
        },
      },
    },
    {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: ['.md', '.mdx'],
        gatsbyRemarkPlugins: [
          'gatsby-remark-images',
          'gatsby-remark-copy-linked-files',
        ],
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.edges
                .filter((edge) => edge.node.frontmatter.lang === 'it')
                .map((edge) => {
                  return Object.assign({}, edge.node.frontmatter, {
                    description: edge.node.excerpt,
                    date: edge.node.frontmatter.date,
                    url:
                      site.siteMetadata.siteUrl +
                      '/blog/' +
                      edge.node.frontmatter.lang +
                      '/' +
                      edge.node.frontmatter.slug,
                    guid:
                      site.siteMetadata.siteUrl +
                      '/blog/' +
                      edge.node.frontmatter.lang +
                      '/' +
                      edge.node.frontmatter.slug,
                    custom_elements: [
                      {
                        preview: `https://blog.veeso.dev${edge.node.frontmatter.featuredImage.childImageSharp.fluid.src}`,
                      },
                    ],
                  });
                });
            },
            query: `
            {
              allMdx(sort: {frontmatter: {date: DESC}}) {
                edges {
                  node {
                    excerpt(pruneLength: 256)
                    frontmatter {
                      title
                      date
                      slug
                      lang
                      featuredImage {
                        childImageSharp {
                          fluid(maxWidth: 1200) {
                            src
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            `,
            output: '/rss/it.xml',
            title: 'Christian Visintin Blog',
            // optional configuration to insert feed reference in pages:
            // if `string` is used, it will be used to create RegExp and then test if pathname of
            // current page satisfied this regular expression;
            // if not provided or `undefined`, all pages will have feed reference inserted
            match: '^/blog/',
          },
          {
            serialize: ({ query: { site, allMdx } }) => {
              return allMdx.edges
                .filter((edge) => edge.node.frontmatter.lang === 'en')
                .map((edge) => {
                  return Object.assign({}, edge.node.frontmatter, {
                    description: edge.node.excerpt,
                    date: edge.node.frontmatter.date,
                    url:
                      site.siteMetadata.siteUrl +
                      '/blog/' +
                      edge.node.frontmatter.lang +
                      '/' +
                      edge.node.frontmatter.slug,
                    guid:
                      site.siteMetadata.siteUrl +
                      '/blog/' +
                      edge.node.frontmatter.lang +
                      '/' +
                      edge.node.frontmatter.slug,
                    custom_elements: [
                      {
                        preview: `https://blog.veeso.dev${edge.node.frontmatter.featuredImage.childImageSharp.fluid.src}`,
                      },
                    ],
                  });
                });
            },
            query: `
            {
              allMdx(sort: {frontmatter: {date: DESC}}) {
                edges {
                  node {
                    excerpt(pruneLength: 256)
                    frontmatter {
                      title
                      date
                      slug
                      lang
                      featuredImage {
                        childImageSharp {
                          fluid(maxWidth: 1200) {
                            src
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            `,
            output: '/rss/en.xml',
            title: 'Christian Visintin Blog',
            // optional configuration to insert feed reference in pages:
            // if `string` is used, it will be used to create RegExp and then test if pathname of
            // current page satisfied this regular expression;
            // if not provided or `undefined`, all pages will have feed reference inserted
            match: '^/blog/',
          },
        ],
      },
    },
  ],
};

export default config;
