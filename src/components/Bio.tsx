import React from "react";
import styled from "styled-components";

import Avatar from "../images/avatar.webp";

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
`;

const ImgCol = styled.div`
  img {
    border-radius: 50%;
    height: auto;
    width: 128px;
  }
`;

const BioCol = styled.div`
  flex: 1;

  p {
    color: #404040;
  }

  a {
    color: #404040;
  }
`;

const Bio = () => (
  <Container>
    <ImgCol>
      <img src={Avatar} alt="a picture of me" />
    </ImgCol>
    <BioCol>
      <p>
        I'm Christian Visintin. I live in Udine, Italy. I'm a software engineer
        at <a href="https://bitfinity.network/">Finity Technologies</a> where I
        work as a Rust developer. I'm also an open-source developer and
        freelancer. On this blog I write about my dev misadventures and give
        unneeded opinions on many topics involving technology and development
      </p>
    </BioCol>
  </Container>
);

export default Bio;
