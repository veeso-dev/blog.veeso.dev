import * as React from 'react';

const Links = (props: React.HTMLProps<HTMLDivElement>) => (
  <div className="pt-2 pl-2" {...props}>
    {props.children}
  </div>
);

export default Links;
