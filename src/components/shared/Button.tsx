import * as React from 'react';

const Primary = (props: React.HTMLProps<HTMLButtonElement>) => (
  <button
    type={'button'}
    className={`${props.className} text-white bg-brand hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-xl text-sm px-5 py-2.5 mr-2 mb-2 800 :bg-gray-700 :ring-gray-700 700`}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    {props.children}
  </button>
);

const Alternative = (props: React.HTMLProps<HTMLButtonElement>) => (
  <button
    type={'button'}
    className={`${props.className} py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-brand focus:outline-none bg-white rounded-xl border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 :ring-gray-700 800 400 600 :text-white :bg-gray-700`}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    {props.children}
  </button>
);

const Tertiary = (props: React.HTMLProps<HTMLButtonElement>) => (
  <button
    type={'button'}
    className={`${props.className} text-white bg-transparent border border-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-200 font-medium rounded-xl text-sm px-5 py-2.5 mr-2 mb-2 800  600 :bg-gray-700 :border-gray-600 :ring-gray-700`}
    disabled={props.disabled}
    onClick={props.onClick}
  >
    {props.children}
  </button>
);

export default {
  Primary,
  Alternative,
  Tertiary,
};
