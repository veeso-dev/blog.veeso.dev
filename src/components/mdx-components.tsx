import React from "react";
import styled from "styled-components";

const H1 = styled.h1`
  color: #101010;
`;

const H2 = styled.h2`
  color: #101010;
  font-size: 1.5em;
  line-height: 2em;
`;

const H3 = styled.h3`
  color: #101010;
  font-size: 1.2em;
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
    padding: 4px;
  }
`;

const ListElement = styled.li`
  color: #303030;
  font-size: 1.1em;
`;

const Anchor = styled.a`
  color: black;
  text-decoration: underline;
`;

const ImgContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

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
};
