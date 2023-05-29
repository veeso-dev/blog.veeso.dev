import styled from "styled-components";

const H1 = styled.h1`
  color: #202020;
`;

const H2 = styled.h2`
  color: #202020;
`;

const H3 = styled.h3`
  color: #202020;
`;

const H4 = styled.h4`
  color: #202020;
`;

const H5 = styled.h5`
  color: #202020;
`;

const Paragraph = styled.p`
  color: #202020;
`;

const Blockquote = styled.blockquote`
  color: #202020;
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
  color: #202020;
`;

const Anchor = styled.a`
  color: #101010;

  text-decoration: underline;
`;

export const MainContent = styled.article``;

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
};
