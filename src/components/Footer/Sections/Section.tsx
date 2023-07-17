import * as React from 'react';

const Section = (props: React.HTMLProps<HTMLDivElement>) => (
  <div className="flex-1" {...props}>
    {props.children}
  </div>
);

export default Section;
