import * as React from "react";
import styled from "styled-components";
import { Facebook, Twitter, Linkedin, Send, Phone } from "react-feather";
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
} from "react-share";

const Container = styled.div`
  color: #606060;
  display: flex;
  flex-direction: row;
  gap: 24px;
  justify-content: end;
  margin: 32px 0;
`;

interface Props {
  url: string;
  title: string;
  description: string;
  author: string;
}

const ShareButtons = (props: Props) => {
  const title = `${props.title} by ${props.author}`;
  return (
    <Container>
      <FacebookShareButton url={props.url} quote={props.description}>
        <Facebook />
      </FacebookShareButton>
      <TwitterShareButton url={props.url} title={title}>
        <Twitter />
      </TwitterShareButton>
      <LinkedinShareButton
        url={props.url}
        title={title}
        summary={props.description}
      >
        <Linkedin />
      </LinkedinShareButton>
      <TelegramShareButton url={props.url} title={title}>
        <Send />
      </TelegramShareButton>
      <WhatsappShareButton url={props.url} title={title}>
        <Phone />
      </WhatsappShareButton>
    </Container>
  );
};

export default ShareButtons;
