import * as React from 'react';

import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE,
  getNavigatorLanguage,
  Language,
  setCookieLanguage,
} from '../../utils/locale';
import Select from '../reusable/Select';

const LanguageSelect = () => {
  const [language, setLanguage] = React.useState(DEFAULT_LANGUAGE);

  React.useEffect(() => {
    setLanguage(getNavigatorLanguage());
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    setCookieLanguage(e.target.value as Language);
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  return (
    <Select
      id="lang-select"
      value={language}
      onChange={onChange}
      selectClassName="!border-0"
    >
      {AVAILABLE_LANGUAGES.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </Select>
  );
};

export default LanguageSelect;
