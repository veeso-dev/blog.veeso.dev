import * as React from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
  id: string;
  strongClassName?: string;
}

const RichTextFormattedMessage = (props: Props) => (
  <FormattedMessage
    id={props.id}
    values={{
      b: (chunks) => (
        <strong className={props.strongClassName}>{chunks}</strong>
      ),
    }}
  />
);

export default RichTextFormattedMessage;
