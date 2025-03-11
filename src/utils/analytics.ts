const pushEvent = (eventName: string, parameters: any) => {
  if (typeof window === 'undefined') {
    console.error('window is undefined');
    return;
  }

  const canUseUmami = window.umami !== undefined;

  if (canUseUmami) {
    try {
      console.log(window.umami);
      window.umami.track(eventName, parameters);
    } catch (e) {
      console.error(`failed to track ${eventName}: ${e}`);
    }
  } else {
    console.error('umami is not available');
  }
};

export const pushCopyCodeEvent = (code: string) => {
  pushEvent('copy_code', { code });
};

export const pushClickRelatedArticle = (title: string) => {
  pushEvent('click_related_article', { title });
};

export const pushLanguageChange = (language: string) => {
  pushEvent('change_language', { language });
};

export const pushThemeChange = (theme: string) => {
  pushEvent('change_theme', { theme });
};

export const pushFacebookShare = (title: string) => {
  pushEvent('share_facebook', { title });
};

export const pushTwitterShare = (title: string) => {
  pushEvent('share_twitter', { title });
};

export const pushLinkedinShare = (title: string) => {
  pushEvent('share_linkedin', { title });
};

export const pushTelegramShare = (title: string) => {
  pushEvent('share_telegram', { title });
};

export const pushWhatsappShare = (title: string) => {
  pushEvent('share_whatsapp', { title });
};
