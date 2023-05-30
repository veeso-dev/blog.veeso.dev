import React from "react";
import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image";
import styled from "styled-components";
import Heading from "../design/Heading";
import Footer from "./Footer";
import Topbar from "./Topbar";

const Main = styled.main`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const PageContent = styled.div`
  margin: 0 24px;
  max-width: 680px;
  width: auto;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 8px;
  }
`;

interface PageLayoutProps {
  image?: IGatsbyImageData | null;
  title?: string;
  subtitle?: string;
}

const Subtitle = styled.h2`
  color: #666;
  font-size: 1.2em;
  padding-bottom: 16px;
`;

export const PageLayout: React.FC<React.PropsWithChildren<PageLayoutProps>> = ({
  children,
  image,
  title,
  subtitle,
}) => {
  return (
    <>
      <Main>
        <PageContent>
          <Topbar />
          {image && (
            <div>
              <GatsbyImage image={image} alt="" className="absolute inset-0" />
              {title && (
                <div>
                  <Heading.H1>{title}</Heading.H1>
                </div>
              )}
              {subtitle && (
                <div>
                  <Subtitle>{subtitle}</Subtitle>
                </div>
              )}
              <div />
            </div>
          )}
          <div className="mx-auto mb-12 max-w-5xl">{children}</div>
        </PageContent>
      </Main>
      <Footer />
    </>
  );
};
