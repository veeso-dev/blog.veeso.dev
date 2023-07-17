import React from "react";
import styled from "styled-components";
import { Highlight, themes } from "prism-react-renderer";
import { onlyText } from "react-children-utilities";

const H1 = styled.h1`
  color: #101010;
`;

const H2 = styled.h2`
  color: #101010;
  font-size: 1.8em;
  line-height: 2em;
`;

const H3 = styled.h3`
  color: #101010;
  font-size: 1.4em;
  line-height: 1.5em;
`;

const H4 = styled.h4`
  color: #101010;
  font-size: 1.1em;
`;

const H5 = styled.h5`
  color: #101010;
`;

const Paragraph = styled.p`
  color: #202020;
  font-size: 1.2em;
  text-align: justify;
`;

const Blockquote = styled.blockquote`
  color: #202020;
  border-left: 3px solid #888;
  margin-left: 24px;
  padding-left: 24px;
`;

const UnorderedList = styled.ul`
  color: #202020;

  > li {
    padding: 4px;
  }
`;

const OrderedList = styled.ol`
  color: #202020;

  > li {
    line-height: 1.5em;
    padding: 4px;
  }
`;

const ListElement = styled.li`
  color: #303030;
  font-size: 1.1em;
`;

const Anchor = styled.a`
  color: rgb(183, 58, 181);
  text-decoration: underline;
`;

const ImgContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-height: 256px;
  }
`;

const Pre = (props: React.HTMLProps<HTMLPreElement>) => {
  const singleChild = React.Children.only(props.children) as React.ReactElement;

  const className = singleChild.props.className || "";
  const matches = className.match(/language-(?<lang>.*)/);

  const lang =
    matches && matches.groups && matches.groups.lang ? matches.groups.lang : "";

  let code = onlyText(props.children).trim();

  return (
    <Highlight code={code} language={lang} theme={themes.github}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={{ ...style, padding: "20px" }}>
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

export const MainContent = styled.article``;

interface ImageProps {
  src: string;
  alt: string;
}

const Image = (props: ImageProps) => (
  <ImgContainer>
    <img src={props.src} alt={props.alt} />
  </ImgContainer>
);

export const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  p: Paragraph,
  ol: OrderedList,
  ul: UnorderedList,
  li: ListElement,
  a: Anchor,
  blockquote: Blockquote,
  img: Image,
  pre: Pre,
};
