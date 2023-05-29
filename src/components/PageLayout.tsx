import { GatsbyImage, IGatsbyImageData } from "gatsby-plugin-image";
import React from "react";

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
    <main className="font-sans font-light">
      {image && (
        <div className="relative mb-12 flex h-96 items-center justify-center">
          <GatsbyImage image={image} alt="" className="absolute inset-0" />
          {title && (
            <div className="z-20 mx-auto max-w-5xl">
              <h1 className="text-4xl font-bold text-white sm:text-5xl">
                {title}
              </h1>
            </div>
          )}
          {/* Darken the background image a little so the text shows up better */}
          <div className="absolute inset-0 z-10 bg-gray-900 opacity-30" />
        </div>
      )}
      <div className="mx-auto mb-12 max-w-5xl">{children}</div>
    </main>
  );
};
