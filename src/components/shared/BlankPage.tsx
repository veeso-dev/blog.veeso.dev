import * as React from 'react';

const BlankPage = (props: React.HTMLProps<HTMLDivElement>) => {
  return (
    <div className={`${props.className} w-screen min-h-screen`}>
      {props.children}
    </div>
  );
};

export default BlankPage;
