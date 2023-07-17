import * as React from 'react';

const Unordered = (props: React.HTMLProps<HTMLUListElement>) => (
  <ul className={`px-8 list-disc sm:px-0 ${props.className}`}>
    {props.children}
  </ul>
);

const Ordered = (props: React.HTMLProps<HTMLOListElement>) => (
  <ol className={`px-8 list-disc sm:px-0 ${props.className}`}>
    {props.children}
  </ol>
);

const Item = (props: React.HTMLProps<HTMLLIElement>) => (
  <li className="text-lg py-2 text-gray-600">{props.children}</li>
);

export default {
  Item,
  Ordered,
  Unordered,
};
