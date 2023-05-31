import React from "react";
import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image";
import styled from "styled-components";
import Heading from "../design/Heading";
import Footer from "./Footer";
import Topbar from "./Topbar";

const Page = styled.main`
  background: #31363b;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3em 0;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const PageContainer = styled.div`
  align-items: center;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: fit-content;

  @media (max-width: 768px) {
    border-radius: 0;
  }
`;

const PageContent = styled.div`
  margin: 24px;
  max-width: 768px;
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
      <Page>
        <PageContainer>
          <PageContent>
            <Topbar />
            {image && (
              <div>
                <GatsbyImage
                  image={image}
                  alt=""
                  className="absolute inset-0"
                />
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
        </PageContainer>
      </Page>
      <Footer />
    </>
  );
};
