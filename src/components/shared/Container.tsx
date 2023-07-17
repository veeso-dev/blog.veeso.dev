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

export default {
  Container,
  Flex,
  FlexCols,
  FlexRow,
  FlexResponsiveRow,
  PageContent,
};
