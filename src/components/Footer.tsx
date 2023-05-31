import * as React from "react";
import styled from "styled-components";

import CONTACTS from "../data/contacts";
import Sections from "./Footer/Sections";

const Container = styled.div`
  background: #31363b;
  color: white;
  margin: 0;
  padding: 24px;

  a {
    color: white;
    :hover {
      text-decoration: underline;
    }
  }
`;

const Border = styled.div`
  background-color: #aaa;
  content: "";
  height: 2px;
  margin-left: 10%;
  width: 80%;

  @media screen and (max-width: 640px) {
    margin-left: 10%;
    width: 80%;
  }
`;

const Copyright = styled.h5`
  color: white;
  font-size: 0.7em;
  text-align: center;
`;

const Vat = styled.h3`
  color: white;
  font-size: 0.9em;
  line-height: 1.5em;
  text-align: center;
`;

const Address = styled.h4`
  color: white;
  font-size: 0.8em;
  line-height: 2em;
  text-align: center;
`;

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer>
      <Container>
        <Border />
        <Sections />
        <Vat>P.IVA {CONTACTS.vat}</Vat>
        <Address>{CONTACTS.address}</Address>
        <Copyright>Copyright © Christian Visintin {year}</Copyright>
      </Container>
    </footer>
  );
};

export default Footer;
