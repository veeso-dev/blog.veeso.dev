import * as React from 'react';

const Default = (props: React.HTMLProps<HTMLParagraphElement>) => (
  <p className={`${props.className} w-full mb-3 text-justify text-gray-500`}>
    {props.children}
  </p>
);

const Brand = (props: React.HTMLProps<HTMLParagraphElement>) => (
  <p className={`${props.className} w-full mb-3 text-justify text-brand`}>
    {props.children}
  </p>
);

const Leading = (props: React.HTMLProps<HTMLParagraphElement>) => (
  <p
    className={`${props.className} w-full mb-3 text-lg text-justify text-gray-500`}
  >
    {props.children}
  </p>
);

const Center = (props: React.HTMLProps<HTMLParagraphElement>) => (
  <p
    className={`${props.className} w-full mb-3 text-lg md:text-xl text-center text-gray-500`}
  >
    {props.children}
  </p>
);

const Markdown = (props: React.HTMLProps<HTMLParagraphElement>) => (
  <p
    className={`${props.className} w-full mb-4 text-justify text-lg text-gray-700`}
  >
    {props.children}
  </p>
);

export default {
  Brand,
  Center,
  Default,
  Leading,
  Markdown,
};
