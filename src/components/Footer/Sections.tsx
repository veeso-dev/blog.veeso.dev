import * as React from 'react';

import CONTACTS from '../../data/contacts';
import Link from './Sections/Link';
import Container from '../shared/Container';
import Section from './Sections/Section';
import Links from './Sections/Links';
import Title from './Sections/Title';

const Sections = () => (
  <Container.FlexResponsiveRow className="flex-wrap items-start gap-4 justify-between p-4">
    <Section>
      <Title>Site</Title>
      <Links>
        <Link.Link href={'https://blog.veeso.dev'} target="_blank">
          Home
        </Link.Link>
        <Link.Link href={'https://www.veeso.dev'} target="_blank">
          veeso.dev
        </Link.Link>
        <Link.Link href="https://termscp.veeso.dev" target="_blank">
          termscp
        </Link.Link>
        <Link.Link href="https://opentapo.veeso.dev" target="_blank">
          OpenTapo
        </Link.Link>
      </Links>
    </Section>
    <Section>
      <Title className="text-white">Social</Title>
      <Links>
        <Link.Link href={CONTACTS.github} target="_blank">
          Github
        </Link.Link>
        <Link.Link href={CONTACTS.linkedin} target="_blank">
          LinkedIn
        </Link.Link>
        <Link.Link href={CONTACTS.linktree} target="_blank">
          Linktree
        </Link.Link>
        <Link.Link href={CONTACTS.twitter} target="_blank">
          Twitter
        </Link.Link>
      </Links>
    </Section>
    <Section>
      <Title className="text-white">Contacts</Title>
      <Links>
        <Link.Link href={`mailto:${CONTACTS.email}`}>
          {CONTACTS.email}
        </Link.Link>
        <Link.Link href={CONTACTS.phoneNumberHref}>
          {CONTACTS.phoneNumber}
        </Link.Link>
        <Link.Link href={CONTACTS.telegram}>Telegram</Link.Link>
        <Link.Link href={CONTACTS.whatsapp}>Whatsapp</Link.Link>
      </Links>
    </Section>
    <Section>
      <Title className="text-white">Legal</Title>
      <Links>
        <Link.Link href={'https://veeso.dev/en/privacy'} target="_blank">
          Privacy
        </Link.Link>
        <Link.Link href={'https://veeso.dev/en/cookie-policy'} target="_blank">
          Cookie Policy
        </Link.Link>
        <Link.Link href={'https://veeso.dev/en/contacts'} target="_blank">
          Contacts
        </Link.Link>
      </Links>
    </Section>
  </Container.FlexResponsiveRow>
);

export default Sections;
