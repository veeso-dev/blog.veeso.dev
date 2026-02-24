import * as React from 'react';

import CONTACTS from '../data/contacts';
import Sections from './Footer/Sections';
import Container from './reusable/Container';
import Heading from './reusable/Heading';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer>
      <Container.Container className="bg-brand text-white m-0 p-8">
        <div className="bg-white content-none h-[1px] mx-auto w-8/12"></div>
        <Sections />
        <Heading.H3 className="text-white text-center text-sm font-normal">
          P.IVA {CONTACTS.vat}
        </Heading.H3>
        <Heading.H4 className="text-white text-center text-sm font-normal">
          {CONTACTS.address}
        </Heading.H4>
        <p className="text-xs text-center font-thin">
          Copyright © Christian Visintin {year}
        </p>
      </Container.Container>
    </footer>
  );
};

export default Footer;
