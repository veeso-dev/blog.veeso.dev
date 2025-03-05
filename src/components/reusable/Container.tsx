import * as React from 'react';

const Container = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <div id={props.id} className={`${props.className}`}>
      {props.children}
    </div>
  );
};

const PageContent = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <div id={props.id} className={`${props.className} w-9/12 sm:11/12 mx-auto`}>
      {props.children}
    </div>
  );
};

const Flex = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <div id={props.id} className={`${props.className} flex`}>
      {props.children}
    </div>
  );
};

const FlexCols = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <div id={props.id} className={`${props.className} flex flex-col`}>
      {props.children}
    </div>
  );
};

const FlexRow = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <div id={props.id} className={`${props.className} flex flex-row`}>
      {props.children}
    </div>
  );
};

const FlexResponsiveRow = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <FlexRow id={props.id} className={`${props.className} sm:flex-col`}>
      {props.children}
    </FlexRow>
  );
};

interface CardProps extends React.HTMLProps<HTMLDivElement> {
  hoverScale?: boolean;
}

const Card = (props: CardProps) => (
  <div
    id={props.id}
    ref={props.ref}
    itemProp={props.itemProp}
    itemScope={props.itemScope}
    itemType={props.itemType}
    onClick={props.onClick}
    className={`${props.className} ${
      props.hoverScale
        ? 'transition-transform transform scale-100 hover:scale-105'
        : ''
    } p-6 bg-white dark:bg-brand border border-gray-200 dark:border-gray-800 rounded-lg shadow`}
  >
    {props.children}
  </div>
);

export default {
  Card,
  Container,
  Flex,
  FlexCols,
  FlexRow,
  FlexResponsiveRow,
  PageContent,
};
