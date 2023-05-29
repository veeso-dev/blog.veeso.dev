import * as React from "react";
import styled from "styled-components";

import type { HeadFC, PageProps } from "gatsby";

const Main = styled.div`
  color: "#232129",
  padding: 96,
  font-family: "-apple-system, Roboto, sans-serif, serif",
`;

const IndexPage: React.FC<PageProps> = () => {
  return <Main></Main>;
};

export default IndexPage;

export const Head: HeadFC = () => <title>Home Page</title>;
