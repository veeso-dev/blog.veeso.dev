import React from "react";
import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image";
import styled from "styled-components";
import Heading from "../design/Heading";

const Main = styled.main`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const PageContent = styled.div`
  margin: 0 24px;
  width: 100%;
  max-width: 680px;

  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

interface PageLayoutProps {
  image?: IGatsbyImageData | null;
  title?: string;
}

export const PageLayout: React.FC<React.PropsWithChildren<PageLayoutProps>> = ({
  children,
  image,
  title,
}) => {
  return (
    <Main>
      <PageContent>
        {image && (
          <div>
            <GatsbyImage image={image} alt="" className="absolute inset-0" />
            {title && (
              <div>
                <Heading.H1>{title}</Heading.H1>
              </div>
            )}
            <div />
          </div>
        )}
        <div className="mx-auto mb-12 max-w-5xl">{children}</div>
      </PageContent>
    </Main>
  );
};
