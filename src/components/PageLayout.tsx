import React from 'react';
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image';

import Heading from './shared/Heading';
import Footer from './Footer';
import Topbar from './Topbar';
import Container from './shared/Container';
import { getTheme, setTheme } from '../utils/utils';

interface PageLayoutProps {
  image?: IGatsbyImageData | null;
  title?: string;
  subtitle?: string;
}

export const PageLayout: React.FC<React.PropsWithChildren<PageLayoutProps>> = ({
  children,
  image,
  title,
  subtitle,
}) => {
  // on visible, init theme
  React.useEffect(() => {
    setTheme(getTheme());
  }, []);

  return (
    <>
      <main className="bg-brand flex flex-col items-center justify-center py-4 sm:py-0">
        <Container.FlexCols className="items-center bg-white dark:bg-brand text-brand dark:text-white rounded shadow-xl justify-center w-fit sm:rounded-none">
          <Container.Container className="m-4 max-w-screen-md w-auto sm:max-w-full p-2">
            <Topbar />
            {image && (
              <div>
                <GatsbyImage
                  image={image}
                  alt=""
                  className="m-8 rounded inset-0"
                />
                {title && (
                  <div>
                    <Heading.H1 className="text-left sm:text-center">
                      {title}
                    </Heading.H1>
                  </div>
                )}
                {subtitle && (
                  <div>
                    <Heading.H2 className="p-4 sm:text-md">
                      {subtitle}
                    </Heading.H2>
                  </div>
                )}
                <div />
              </div>
            )}
            <div className="mx-auto mb-12 max-w-5xl">{children}</div>
          </Container.Container>
        </Container.FlexCols>
      </main>
      <Footer />
    </>
  );
};
