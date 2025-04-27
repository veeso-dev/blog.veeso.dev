import * as React from 'react';

import CONTACTS from '../../data/contacts';
import Link from './Sections/Link';
import Container from '../reusable/Container';
import Section from './Sections/Section';
import Links from './Sections/Links';
import Title from './Sections/Title';
import RichTextFormattedMessage from '../reusable/RichTextFormattedMessage';

const Sections = () => (
  <Container.FlexResponsiveRow className="flex-wrap items-start gap-4 justify-between p-4">
    <Section>
      <Title>
        <RichTextFormattedMessage id={'footer.site'} />
      </Title>
      <Links>
        <Link.Link href={'https://blog.veeso.dev'} target="_blank">
          Home
        </Link.Link>
        <Link.Link href={'https://veeso.dev'} target="_blank">
          veeso.dev
        </Link.Link>
        <Link.Link href={'https://veeso.me'} target="_blank">
          veeso.me
        </Link.Link>
        <Link.Link href="https://termscp.veeso.dev" target="_blank">
          termscp
        </Link.Link>
      </Links>
    </Section>
    <Section>
      <Title className="text-white">
        <RichTextFormattedMessage id={'footer.social'} />
      </Title>
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
        <Link.Link href={CONTACTS.mastodon} target="_blank">
          Mastodon
        </Link.Link>
      </Links>
    </Section>
    <Section>
      <Title className="text-white">
        <RichTextFormattedMessage id={'footer.contacts'} />
      </Title>
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
      <Title className="text-white">
        <RichTextFormattedMessage id={'footer.legal'} />
      </Title>
      <Links>
        <Link.Link href={'https://veeso.dev/privacy'} target="_blank">
          Privacy
        </Link.Link>
        <Link.Link href={'https://veeso.dev/cookie-policy'} target="_blank">
          Cookie Policy
        </Link.Link>
        <Link.Link href={'https://veeso.dev/contacts'} target="_blank">
          <RichTextFormattedMessage id={'footer.contacts'} />
        </Link.Link>
      </Links>
    </Section>
  </Container.FlexResponsiveRow>
);

export default Sections;
