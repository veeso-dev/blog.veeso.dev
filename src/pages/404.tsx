import * as React from "react";
import styled from "styled-components";
import "../styles/global.css";

import { PageLayout } from "../components/PageLayout";
import { Link } from "gatsby";

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Text404 = styled.h1`
  color: #444;
  font-size: 15em;

  @media screen and (max-width: 640px) {
    font-size: 5em;
  }
`;

const Subtitle = styled.h2`
  color: #666;
  font-size: 5em;

  @media screen and (max-width: 640px) {
    font-size: 2em;
  }
`;

const Goback = styled.h3`
  color: #222;
  font-size: 2em;
  line-height: 3em;

  @media screen and (max-width: 640px) {
    font-size: 1.5em;
  }

  a {
    color: #222;
    text-decoration: none;
  }
`;

const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <PageLayout>
      <Container>
        <Text404>404</Text404>
        <Subtitle>Page not found</Subtitle>
        <Goback>
          <Link to="/">Go back to home</Link>
        </Goback>
      </Container>
    </PageLayout>
  );
};

export default NotFoundPage;

export const Head: HeadFC = () => <title>Page Not found</title>;
