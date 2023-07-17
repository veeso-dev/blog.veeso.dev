import * as React from 'react';
import '../styles/global.css';

import { PageLayout } from '../components/PageLayout';
import { Link } from 'gatsby';
import Container from '../components/shared/Container';
import Heading from '../components/shared/Heading';

const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <PageLayout>
      <Container.FlexCols className="items-center justify-center">
        <Heading.H1 className="text-4xl text-brand sm:text-3xl">404</Heading.H1>
        <Heading.H2 className="text-3xl text-brand sm:text-2xl">
          Page not found
        </Heading.H2>
        <Heading.H3 className="text-brand">
          <Link to="/">Go back to home</Link>
        </Heading.H3>
      </Container.FlexCols>
    </PageLayout>
  );
};

export default NotFoundPage;

export const Head: HeadFC = () => <title>Page Not found</title>;
