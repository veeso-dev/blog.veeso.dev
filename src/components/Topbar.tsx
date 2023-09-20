import * as React from 'react';
import { Link } from 'gatsby';

import Socials from './Topbar/Socials';
import Heading from './reusable/Heading';
import SharedLink from './reusable/Link';
import Container from './reusable/Container';
import ThemeToggle from './Topbar/ThemeToggle';
import { StaticImage } from 'gatsby-plugin-image';

const DesktopTopbar = () => {
  return (
    <Container.FlexCols className="items-start justify-between w-full top-0">
      <Container.Flex className="gap-4 items-center">
        <div>
          <Link className="text-brand no-underline" to={'/'}>
            <StaticImage
              height={64}
              width={64}
              src={'../images/logo.webp'}
              loading="eager"
              alt="logo"
            />
          </Link>
        </div>
        <Heading.H1>
          <Link
            className="text-brand dark:text-gray-200 no-underline text-left sm:text-xl"
            to={'/'}
          >
            Christian Visintin
          </Link>
        </Heading.H1>
      </Container.Flex>
      <Container.FlexResponsiveRow className="items-center justify-between w-full sm:items-start sm:gap-4">
        <Container.Flex className="gap-4">
          <Link
            className="text-gray-500 dark:text-gray-200 no-underline text-xl transition-[0.5s] hover:text-brand hover:underline cursor-pointer"
            to={'/blog'}
          >
            Blog
          </Link>
          <SharedLink.Default
            className="text-gray-500 dark:text-gray-200 no-underline text-xl transition-[0.5s] hover:text-brand hover:underline cursor-pointer"
            href={'https://www.veeso.dev/'}
            target="_blank"
          >
            About
          </SharedLink.Default>
        </Container.Flex>
        <Container.Flex className="justify-self-end items-end justify-between">
          <Container.Flex className="items-center justify-between gap-8 ph-8">
            <ThemeToggle />
            <Socials />
          </Container.Flex>
        </Container.Flex>
      </Container.FlexResponsiveRow>
    </Container.FlexCols>
  );
};

export default DesktopTopbar;
