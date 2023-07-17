import React from 'react';

import Avatar from '../images/avatar.webp';
import Container from './shared/Container';
import Link from './shared/Link';
import Paragraph from './shared/Paragraph';

const Bio = () => (
  <Container.FlexResponsiveRow className="items-center justify-between gap-8 p-10">
    <div>
      <img
        className="rounded-full h-auto w-[128px]"
        src={Avatar}
        alt="a picture of me"
      />
    </div>
    <Container.Container className="flex-1">
      <Paragraph.Brand className="text-brand">
        I'm Christian Visintin. I live in Udine, Italy. I'm a software engineer
        at{' '}
        <Link.Paragraph href="https://bitfinity.network/">
          Finity Technologies
        </Link.Paragraph>{' '}
        where I work as a Rust developer. I'm also an open-source developer and
        freelancer. On this blog I write about my dev misadventures and give
        unneeded opinions on many topics involving technology and development
      </Paragraph.Brand>
    </Container.Container>
  </Container.FlexResponsiveRow>
);

export default Bio;
