import * as React from 'react';
import { Twitter, Linkedin, GitHub, Rss } from 'react-feather';

import CONTACTS from '../../data/contacts';
import Link from '../reusable/Link';
import { getNavigatorLanguage } from '../../utils/locale';

const Socials = () => {
  return (
    <>
      <Link.IconLink href={CONTACTS.github} target="_blank">
        <GitHub />
      </Link.IconLink>
      <Link.IconLink href={CONTACTS.twitter} target="_blank">
        <Twitter />
      </Link.IconLink>
      <Link.IconLink href={CONTACTS.linkedin} target="_blank">
        <Linkedin />
      </Link.IconLink>
      <Link.IconLink
        href={`/rss/${getNavigatorLanguage()}.xml`}
        target="_blank"
      >
        <Rss />
      </Link.IconLink>
    </>
  );
};

export default Socials;
