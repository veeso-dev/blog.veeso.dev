import * as React from 'react';
import { Link } from 'gatsby';

import Heading from './reusable/Heading';
import { readingTime } from '../utils/utils';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';
import Container from './reusable/Container';
import Paragraph from './reusable/Paragraph';

interface Props {
  className?: string;
  link: string;
  title: string;
  excerpt: string;
  date: string;
  subtitle: string;
  body: string;
  image?: IGatsbyImageData;
}

const PostLink = (props: Props) => {
  const preview = props.image ? (
    <Container.Container className="py-2">
      <GatsbyImage
        image={props.image}
        alt={props.subtitle}
        loading="eager"
        className="rounded shadow-xl inset-0"
      />
    </Container.Container>
  ) : undefined;
  return (
    <Container.Container className={`${props.className} p-2 border-b`}>
      {preview}
      <Heading.H2>
        <Link to={props.link} className="text-brand dark:text-gray-200">
          {props.title}
        </Link>
      </Heading.H2>
      <Heading.H3>{props.subtitle}</Heading.H3>
      <Paragraph.Leading>{props.excerpt}</Paragraph.Leading>
      <Paragraph.Default className="text-gray-400 dark:text-gray-200">
        Published on {props.date} — {readingTime(props.body)} min read{' '}
      </Paragraph.Default>
    </Container.Container>
  );
};

export default PostLink;
