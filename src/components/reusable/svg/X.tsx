import * as React from 'react';

interface Props {
  size?: number;
  fill?: string;
  className?: string;
}

const X = (props: Props) => (
  <svg
    className={props.className}
    xmlns="http://www.w3.org/2000/svg"
    width={props.size ? props.size : 24}
    height={props.size ? props.size : 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="21.3,21.1 9.9,2.9 2.7,2.9 14.1,21.1 " />
    <line x1="2.7" y1="21.1" x2="9.9" y2="14.5" />
    <line x1="14.1" y1="9.5" x2="21.3" y2="2.9" />
  </svg>
);

export default X;
