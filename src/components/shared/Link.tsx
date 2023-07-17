import * as React from 'react';

const Default = (props: React.HTMLProps<HTMLAnchorElement>) => (
  <a
    href={props.href}
    className="font-medium text-brand  dark:text-gray-200 hover:underline"
    {...props}
  >
    {props.children}
  </a>
);

const Button = (props: React.HTMLProps<HTMLAnchorElement>) => (
  <a
    href={props.href}
    className="font-medium bg-brand text-white dark:bg-white dark:text-brand hover:underline focus:ring-4 focus:ring-brand rounded-full"
    {...props}
  >
    {props.children}
  </a>
);

const Paragraph = (props: React.HTMLProps<HTMLAnchorElement>) => (
  <a
    href={props.href}
    className="font-medium text-brand dark:text-gray-200 underline hover:no-underline"
    {...props}
  >
    {props.children}
  </a>
);

const IconLink = (props: React.HTMLProps<HTMLAnchorElement>) => (
  <a
    href={props.href}
    className="inline-flex items-center cursor-pointer font-medium text-brand dark:text-gray-200 hover:underline"
    {...props}
  >
    {props.children}
  </a>
);

export default {
  Button,
  Default,
  IconLink,
  Paragraph,
};
