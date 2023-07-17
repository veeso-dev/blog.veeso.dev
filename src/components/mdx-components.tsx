import React from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { onlyText } from 'react-children-utilities';
import Heading from './shared/Heading';
import Paragraph from './shared/Paragraph';
import List from './shared/List';
import Link from './shared/Link';

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

const Pre = (props: React.HTMLProps<HTMLPreElement>) => {
  const singleChild = React.Children.only(props.children) as React.ReactElement;

  const className = singleChild.props.className || '';
  const matches = className.match(/language-(?<lang>.*)/);

  const lang =
    matches && matches.groups && matches.groups.lang ? matches.groups.lang : '';

  const code = onlyText(props.children).trim();

  return (
    <Highlight code={code} language={lang} theme={themes.github}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style, padding: '20px' }}>
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
    <img {...props} />
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
