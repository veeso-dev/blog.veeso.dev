import * as React from 'react';

import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import Container from './reusable/Container';
import Paragraph from './reusable/Paragraph';

interface Props {
  posts: any[];
}

const RelatedPosts = ({ posts }: Props) => (
  <Container.Container>
    <Container.Container className="pt-4 pb-2">
      <span className="text-xl block text-brand dark:text-white font-normal">
        You might also like
      </span>
    </Container.Container>
    <Container.Container className="grid grid-cols-2 sm:grid-cols-1 gap-4 items-start justify-between">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </Container.Container>
  </Container.Container>
);

export default RelatedPosts;

const PostCard = ({ post }: { post: any }) => {
  const featuredImage = post.frontmatter?.featuredImage
    ? getImage(post.frontmatter.featuredImage.childImageSharp)
    : null;

  const title = post.frontmatter?.title;

  return (
    <Container.Card className="!px-0 !p-0 flex-1 h-full w-auto" hoverScale>
      {featuredImage && (
        <div className="rounded-t-lg">
          <GatsbyImage
            imgClassName="rounded-t-lg"
            image={featuredImage}
            alt=""
            className="inset-0"
          />
        </div>
      )}
      <Container.Container className="pt-4 pb-6 px-6">
        {title && (
          <div>
            <span className="text-md sm:text-lg py-2 dark:text-white text-brand font-normal">
              {title}
            </span>
          </div>
        )}
        <Paragraph.Default className="text-sm sm:text-md py-2">
          {post.excerpt}
        </Paragraph.Default>
      </Container.Container>
    </Container.Card>
  );
};
