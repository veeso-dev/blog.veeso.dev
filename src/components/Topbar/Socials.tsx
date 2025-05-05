import * as React from 'react';
import { Linkedin, GitHub, Rss } from 'react-feather';

import CONTACTS from '../../data/contacts';
import Link from '../reusable/Link';
import { getNavigatorLanguage } from '../../utils/locale';
import { isThemeLight } from '../../utils/utils';
import Mastodon from '../reusable/svg/Mastodon';
import { useAppContext } from '../AppContext';

const Socials = () => {
  const { theme } = useAppContext();
  const fill = React.useMemo(
    () => (isThemeLight(theme) ? '#31363b' : '#fff'),
    [theme],
  );

  return (
    <>
      <Link.IconLink href={CONTACTS.github} target="_blank">
        <GitHub />
      </Link.IconLink>
      <Link.IconLink href={CONTACTS.mastodon} target="_blank">
        <Mastodon fill={fill} />
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
