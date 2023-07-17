import * as React from 'react';
import Heading from '../../shared/Heading';

const Title = (props: React.HTMLProps<HTMLHeadingElement>) => (
  <Heading.H2 className="text-white py-4 font-normal">
    {props.children}
  </Heading.H2>
);

export default Title;
