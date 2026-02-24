import * as React from 'react';

import SharedLink from '../../reusable/Link';

const Link = (props: React.HTMLProps<HTMLAnchorElement>) => (
  <SharedLink.Default
    className="py-2 text-white block hover:text-gray-200"
    {...props}
  >
    {props.children}
  </SharedLink.Default>
);

export default {
  Link,
};
