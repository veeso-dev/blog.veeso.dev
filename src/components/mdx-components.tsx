import React from 'react';
import { Check, Copy } from 'react-feather';
import { Highlight, themes } from 'prism-react-renderer';
import { onlyText } from 'react-children-utilities';

import Heading from './reusable/Heading';
import Paragraph from './reusable/Paragraph';
import List from './reusable/List';
import Link from './reusable/Link';
import { Theme, getTheme } from '../utils/utils';

const Blockquote = (props: React.HTMLProps<HTMLQuoteElement>) => (
  <blockquote className="text-gray-500 border-l-4 ml-4 pl-4" {...props}>
    {props.children}
  </blockquote>
);

const ImgContainer = (props: React.HTMLProps<HTMLDivElement>) => (
  <div className="flex justify-center items-center md-img-container" {...props}>
    {props.children}
  </div>
);

interface PreCopyButtonProps {
  content: string;
}

const PreCopyButton = (props: PreCopyButtonProps) => {
  const [copied, setCopied] = React.useState(false);

  const onClick = () => {
    if (typeof navigator === 'undefined') return;

    navigator.clipboard.writeText(props.content).then(() => {
      setCopied(true);
    });
  };

  return (
    <button
      onClick={onClick}
      className={`bg-inherit absolute right-4 top-4 rounded border-gray-500 border-2 p-2 hover:bg-gray-200 active:bg-gray-300`}
    >
      {(copied && <Check size={16} />) || <Copy size={16} />}
    </button>
  );
};

const Pre = (props: React.HTMLProps<HTMLPreElement>) => {
  const singleChild = React.Children.only(props.children) as React.ReactElement;

  const className = singleChild.props.className || '';
  const matches = className.match(/language-(?<lang>.*)/);

  const lang =
    matches && matches.groups && matches.groups.lang ? matches.groups.lang : '';

  const code = onlyText(props.children).trim();

  const theme = getTheme() === Theme.DARK ? themes.vsDark : themes.github;

  return (
    <Highlight code={code} language={lang} theme={theme}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} overflow-x-auto w-full relative`}
          style={{ ...style, padding: '20px' }}
        >
          <PreCopyButton content={code} />
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
};

export const MainContent = (props: React.HTMLProps<HTMLDivElement>) => (
  <article className="px-8" {...props}>
    {props.children}
  </article>
);

const Image = (props: React.HTMLProps<HTMLImageElement>) => (
  <ImgContainer>
    <img {...props} loading="lazy" />
  </ImgContainer>
);

export const components = {
  a: Link.Paragraph,
  blockquote: Blockquote,
  h1: Heading.H1,
  h2: Heading.H2,
  h3: Heading.H3,
  h4: Heading.H4,
  h5: Heading.H5,
  img: Image,
  li: List.Item,
  ol: List.Ordered,
  p: Paragraph.Markdown,
  pre: Pre,
  ul: List.Unordered,
};
