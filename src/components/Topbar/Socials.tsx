import * as React from "react";
import styled from "styled-components";
import { Twitter, Linkedin, GitHub, Rss } from "react-feather";

import CONTACTS from "../../data/contacts";

const SiteSocials = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 32px;
  padding: 0 32px;
`;

const Social = styled.a`
  color: #606060;
  display: block;
  padding: 8px 0;
  text-decoration: none;
  transition: 0.5s;

  :hover {
    color: #202020;
  }
`;

const Socials = () => {
  return (
    <SiteSocials>
      <Social href={CONTACTS.github} target="_blank">
        <GitHub />
      </Social>
      <Social href={CONTACTS.twitter} target="_blank">
        <Twitter />
      </Social>
      <Social href={CONTACTS.linkedin} target="_blank">
        <Linkedin />
      </Social>
      <Social href={"/rss.xml"} target="_blank">
        <Rss />
      </Social>
    </SiteSocials>
  );
};

export default Socials;
