import * as React from "react";
import styled from "styled-components";

import CONTACTS from "../../data/contacts";
import Heading from "../../design/Heading";

const Container = styled.div`
  align-items: start;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-between;
  padding: 24px;

  @media screen and (max-width: 640px) {
    flex-direction: column;
  }
`;

const Section = styled.div`
  flex: 1;
`;

const Links = styled.div`
  padding: 16px 0 0 16px;
`;

const Uri = styled.a`
  display: block;
  padding: 8px 0;
  text-decoration: none;
  width: fit-content;
`;

const Sections = () => (
  <Container>
    <Section>
      <Heading.H2>Site</Heading.H2>
      <Links>
        <Uri href="https://blog.veeso.dev" target="_blank">
          Home
        </Uri>
        <Uri href="https://www.veeso.dev" target="_blank">
          Veeso
        </Uri>
        <Uri href="https://termscp.veeso.dev" target="_blank">
          termscp
        </Uri>
        <Uri href="https://opentapo.veeso.dev" target="_blank">
          OpenTapo
        </Uri>
      </Links>
    </Section>
    <Section>
      <Heading.H2>Social</Heading.H2>
      <Links>
        <Uri href={CONTACTS.github} target="_blank">
          Github
        </Uri>
        <Uri href={CONTACTS.linkedin} target="_blank">
          LinkedIn
        </Uri>
        <Uri href={CONTACTS.linktree} target="_blank">
          Linktree
        </Uri>
        <Uri href={CONTACTS.twitter} target="_blank">
          Twitter
        </Uri>
      </Links>
    </Section>
    <Section>
      <Heading.H2>Contacts</Heading.H2>
      <Links>
        <Uri href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</Uri>
        <Uri href={CONTACTS.phoneNumberHref}>{CONTACTS.phoneNumber}</Uri>
        <Uri href={CONTACTS.telegram}>Telegram</Uri>
        <Uri href={CONTACTS.whatsapp}>Whatsapp</Uri>
      </Links>
    </Section>
    <Section>
      <Heading.H2>Legal</Heading.H2>
      <Links>
        <Uri href="https://veeso.dev/en/privacy" target="_blank">
          Privacy
        </Uri>
        <Uri href="https://veeso.dev/en/cookie-policy" target="_blank">
          Cookie Policy
        </Uri>
        <Uri href="https://veeso.dev/en/contacts" target="_blank">
          Contacts
        </Uri>
      </Links>
    </Section>
  </Container>
);
export default Sections;
