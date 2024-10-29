import * as React from 'react';
import Container from './Container';

interface Props {
  id: string;
  className?: string;
  selectClassName?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
  children: React.ReactNode;
}

const selectStyle = (
  valueSelected: boolean,
  disabled?: boolean,
  required?: boolean,
): string => {
  if (required === true && disabled !== true && valueSelected === false) {
    return 'ring-yellow-500 ring-2 bg-white';
  }

  if (disabled) {
    return 'hover:cursor-not-allowed bg-gray-50';
  }

  return 'bg-white';
};

const Select = (props: Props) => {
  const [hasSelected, setHasSelected] = React.useState(false);

  const onValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHasSelected(true);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <Container.Container className={`${props.className}`}>
      {props.label && (
        <label
          htmlFor={props.id}
          className="block mb-2 text-sm font-medium text-text"
        >
          {props.label}
          {props.required && ' *'}
        </label>
      )}
      <select
        id={props.id}
        value={props.value}
        disabled={props.disabled}
        onChange={onValueChange}
        required={props.required}
        className={`${props.selectClassName} ${selectStyle(
          hasSelected,
          props.disabled,
          props.required,
        )} border border-gray-300 text-brand text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5`}
      >
        {props.children}
      </select>
    </Container.Container>
  );
};

export default Select;
