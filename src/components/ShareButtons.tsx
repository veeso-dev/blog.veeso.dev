import * as React from 'react';
import { Facebook, Twitter, Linkedin, Send, Phone } from 'react-feather';
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
} from 'react-share';

import Container from './reusable/Container';
import Whatsapp from './reusable/svg/WhatsApp';
import Telegram from './reusable/svg/Telegram';

interface Props {
  url: string;
  title: string;
  description: string;
  author: string;
}

const ShareButtons = (props: Props) => {
  const title = `${props.title} by ${props.author}`;
  return (
    <Container.FlexRow className="text-brand dark:text-gray-200 gap-8 justify-end">
      <FacebookShareButton url={props.url} quote={props.description}>
        <Facebook className="transition-transform transform scale-100 hover:scale-125" />
      </FacebookShareButton>
      <TwitterShareButton url={props.url} title={title}>
        <Twitter className="transition-transform transform scale-100 hover:scale-125" />
      </TwitterShareButton>
      <LinkedinShareButton
        url={props.url}
        title={title}
        summary={props.description}
      >
        <Linkedin className="transition-transform transform scale-100 hover:scale-125" />
      </LinkedinShareButton>
      <TelegramShareButton url={props.url} title={title}>
        <Telegram
          size={20}
          fill="#31363b"
          className="transition-transform transform scale-100 hover:scale-125"
        />
      </TelegramShareButton>
      <WhatsappShareButton url={props.url} title={title}>
        <Whatsapp
          size={20}
          className="transition-transform transform scale-100 hover:scale-125"
        />
      </WhatsappShareButton>
    </Container.FlexRow>
  );
};

export default ShareButtons;
