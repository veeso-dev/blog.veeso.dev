import * as React from 'react';
import { Twitter, Linkedin, GitHub, Rss } from 'react-feather';

import CONTACTS from '../../data/contacts';
import Container from '../shared/Container';
import Link from '../shared/Link';

const Socials = () => {
  return (
    <Container.Flex className="items-center justify-between gap-8 ph-8">
      <Link.IconLink href={CONTACTS.github} target="_blank">
        <GitHub />
      </Link.IconLink>
      <Link.IconLink href={CONTACTS.twitter} target="_blank">
        <Twitter />
      </Link.IconLink>
      <Link.IconLink href={CONTACTS.linkedin} target="_blank">
        <Linkedin />
      </Link.IconLink>
      <Link.IconLink href={'/rss.xml'} target="_blank">
        <Rss />
      </Link.IconLink>
    </Container.Flex>
  );
};

export default Socials;
