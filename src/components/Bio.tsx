import React from 'react';

import Container from './reusable/Container';
import Paragraph from './reusable/Paragraph';
import RichTextFormattedMessage from './reusable/RichTextFormattedMessage';
import { StaticImage } from 'gatsby-plugin-image';

const Bio = () => (
  <Container.FlexResponsiveRow className="items-center justify-between gap-8 p-10">
    <div>
      <StaticImage
        className="rounded-full h-auto w-[128px]"
        src={'../images/avatar.webp'}
        alt="a picture of me"
        loading="eager"
      />
    </div>
    <Container.Container className="flex-1">
      <Paragraph.Brand className="text-brand">
        <RichTextFormattedMessage id={'home.brief'} />
      </Paragraph.Brand>
    </Container.Container>
  </Container.FlexResponsiveRow>
);

export default Bio;
