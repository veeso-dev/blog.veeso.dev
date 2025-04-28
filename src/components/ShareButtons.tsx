import * as React from 'react';
import { Facebook, Linkedin } from 'react-feather';
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
import { isThemeLight } from '../utils/utils';
import X from './reusable/svg/X';
import {
  pushFacebookShare,
  pushLinkedinShare,
  pushTelegramShare,
  pushTwitterShare,
  pushWhatsappShare,
} from '../utils/analytics';

interface Props {
  url: string;
  title: string;
  description: string;
  author: string;
}

const ShareButtons = (props: Props) => {
  const title = `${props.title} by ${props.author}`;
  const fill = isThemeLight() ? '#31363b' : '#fff';

  return (
    <Container.FlexRow className="text-brand dark:text-gray-200 gap-8 justify-end">
      <FacebookShareButton
        onClick={() => pushFacebookShare(props.title)}
        url={props.url}
      >
        <Facebook className="transition-transform transform scale-100 hover:scale-125" />
      </FacebookShareButton>
      <TwitterShareButton
        onClick={() => pushTwitterShare(props.title)}
        url={props.url}
        title={title}
      >
        <X
          width={20}
          height={20}
          fill={fill}
          className="transition-transform transform scale-100 hover:scale-125"
        />
      </TwitterShareButton>
      <LinkedinShareButton
        onClick={() => pushLinkedinShare(props.title)}
        url={props.url}
        title={title}
        summary={props.description}
      >
        <Linkedin className="transition-transform transform scale-100 hover:scale-125" />
      </LinkedinShareButton>
      <TelegramShareButton
        onClick={() => pushTelegramShare(props.title)}
        url={props.url}
        title={title}
      >
        <Telegram
          size={20}
          fill={fill}
          className="transition-transform transform scale-100 hover:scale-125"
        />
      </TelegramShareButton>
      <WhatsappShareButton
        onClick={() => pushWhatsappShare(props.title)}
        url={props.url}
        title={title}
      >
        <Whatsapp
          size={20}
          fill={fill}
          className="transition-transform transform scale-100 hover:scale-125"
        />
      </WhatsappShareButton>
    </Container.FlexRow>
  );
};

export default ShareButtons;
