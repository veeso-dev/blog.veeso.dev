import * as React from "react";
import styled from "styled-components";
import { Link } from "gatsby";

import Socials from "./Topbar/Socials";
import Heading from "../design/Heading";
import { Link as LinkIcon } from "react-feather";

const Header = styled.div`
  align-items: start;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 0;
  width: 100%;
`;

const HeaderTop = styled.div`
  display: flex;
`;

const HeaderBot = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const HeaderBotLeft = styled.div`
  display: flex;
  gap: 24px;
`;

const HeaderBotRight = styled.div`
  align-items: end;
  display: flex;
  justify-content: space-between;
`;

const TopbarLink = styled(Link)`
  color: #606060;
  font-size: 1.2em;
  text-decoration: none;
  transition: 0.5s;

  :hover {
    color: #202020;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const Href = styled.a`
  color: #606060;
  font-size: 1.2em;
  text-decoration: none;
  transition: 0.5s;

  :hover {
    color: #202020;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const DesktopTopbar = () => {
  return (
    <Header>
      <HeaderTop>
        <Heading.H1>Christian Visintin</Heading.H1>
      </HeaderTop>
      <HeaderBot>
        <HeaderBotLeft>
          <TopbarLink to={"/blog"}>Blog</TopbarLink>
          <Href href={"https://www.veeso.dev/"} target="_blank">
            About
          </Href>
        </HeaderBotLeft>
        <HeaderBotRight>
          <Socials />
        </HeaderBotRight>
      </HeaderBot>
    </Header>
  );
};

export default DesktopTopbar;
