import React from 'react';

import Avatar from '../images/avatar.webp';
import Container from './reusable/Container';
import Paragraph from './reusable/Paragraph';
import RichTextFormattedMessage from './reusable/RichTextFormattedMessage';

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
        <RichTextFormattedMessage id={'home.brief'} />
      </Paragraph.Brand>
    </Container.Container>
  </Container.FlexResponsiveRow>
);

export default Bio;
