import * as React from 'react';
import { Linkedin, GitHub, Rss } from 'react-feather';

import CONTACTS from '../../data/contacts';
import Link from '../reusable/Link';
import { getNavigatorLanguage } from '../../utils/locale';
import { isThemeLight } from '../../utils/utils';
import X from '../reusable/svg/X';

const Socials = () => {
  const fill = isThemeLight() ? '#31363b' : '#fff';

  return (
    <>
      <Link.IconLink href={CONTACTS.github} target="_blank">
        <GitHub />
      </Link.IconLink>
      <Link.IconLink href={CONTACTS.twitter} target="_blank">
        <X fill={fill} />
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
