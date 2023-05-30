import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `Christian Visintin | Blog`,
    description: `I'm a dev and rustacean writing about my dev misadventures and give unneeded opinions on many topics involving technology and development`,
    author: "Christian Visintin",
    siteUrl: `https://blog.veeso.dev`,
    navigation: [
      {
        name: "Blog",
        path: "/blog",
      },
    ],
  },
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-styled-components",
    "gatsby-plugin-image",
    "gatsby-plugin-sitemap",
    "gatsby-remark-images",
    "gatsby-remark-copy-linked-files",
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/blog/",
      },
      __key: "blog",
    },
    {
      options: {
        path: `${__dirname}/src/blog`,
      },
      resolve: "gatsby-plugin-page-creator",
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        // your google analytics tracking id
        trackingIds: ["G-P1G1JW9N1R"],
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
      resolve: "gatsby-plugin-mdx",
      options: {
        extensions: [".md", ".mdx"],
        gatsbyRemarkPlugins: [
          "gatsby-remark-images",
          "gatsby-remark-copy-linked-files",
        ],
      },
    },
  ],
};

export default config;
