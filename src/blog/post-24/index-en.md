---
date: '2024-12-16 10:45:00'
slug: 'how-to-make-react--markdown-work-with-parcel'
title: 'How to make react-markdown work with Parcel?'
subtitle: 'I literally got mad with react-markdown to make it work with Parcel. Now you have a guide to make it work'
author: 'veeso'
featuredImage: ./featured.jpeg
lang: en
tag: react
---

## Audience

If you encounter an error like this while trying to render a markdown with react-markdown and you're using parcel

```txt
Uncaught TypeError: Cannot convert undefined or null to object
Cannot read properties of undefined (reading 'src')
```

this article is for you 🙂

This error should be fixed in parcel 3.x, that hasn't been released yet when I wrote this article.

## TL;DR

```sh
yarn add react-markdown information-property
```

```ts
// my react-markdown wrapper component
import 'property-information';
```

```jsonc
// package.json
{
  "@parcel/resolver-default": {
    "packageExports": true
  }
}
```

## Introduction

I love Parcel. It's very easy to use without bloated configuration (see webpack) and it's fast. Yeah, sometimes I get errors while adding dependencies and I have to clean everything up (is it only me), but apart of that I really appreciate it.

A few days ago I needed to render markdown on my page, so I opted for `react-markdown`.

The first thing I did was to add `react-markdown` to my package.json:

```sh
yarn add react-markdown
```

and I also added `remark-gfm` to support autolink literals, footnotes, strikethrough, tables, tasklists in markdown:

```sh
yarn add remark-gfm
```

then I created my MdPage component

```tsx
import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  githubUrl: string;
  url: string;
}

const MdPage = ({ url, githubUrl }: Props) => {
  const { setAppError } = useAppContext();
  const [md, setMd] = React.useState('');

  React.useEffect(() => {
    fetch(url)
      .then((res) => res.text())
      .then(setMd)
      .catch((err) => {
        console.error('Failed to load page', err);
        setAppError('Failed to load page');
      });
  }, [url]);

  return (
    <Wrapper>
      <Container.Container>
        <Container.FlexRow className="items-end justify-end w-full">
          <Container.Container>
            <Link.Button href={githubUrl} target="_blank">
              <Icon.FaGithub className="inline mr-2" size={24} /> View on GitHub
            </Link.Button>
          </Container.Container>
        </Container.FlexRow>
        <Container.Container className={'markdown'}>
          {md && (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
          )}
        </Container.Container>
      </Container.Container>
    </Wrapper>
  );
};
```

But no matter what I got this error as soon as I started to render my markdown page:

```txt
Cannot read properties of undefined (reading 'src')
```

The first thing I thought was that my markdown was the issue, which sounded weird considering that I always folllow all the guidelines with markdown, but I thought that maybe the images which had a relative path to the repo could lead to this issue.

I tried with the markdown of the example of `react-markdown` and I still got that issue.

Finally I just rendered this

```ts
const markdown = `A paragraph with *emphasis* and **strong importance**.`;
```

And finally it worked.

![pikachu stunned](./pikachu.gif)

So, apparently as soon as I place a `img` or a link in my markdown the engine dies.

I will avoid the step-by-step journey in trying several plugins and other things in the react-markdown configuration to see if using a custom component could work or if I was missing a certain plugin. It just didn't work.

All my attempts failed, until I found [this issue on Github](https://github.com/remarkjs/react-markdown/issues/747).

So here the OP says he's using parcel and whenever he tries to use a link he gets `Cannot convert undefined or null to object`. Looks familiar uh?

So apparently they say that parcel has issues with react-markdown for whatever reasons, BUT, the fix shown in the issue actually SOLVES the issue.

Let's see how to implement it.

## Fix

### Information property

So apparently all we have to do is to install `information-property` and to import it. But wait, what is information-property?

From the README

> What is this?
> This package contains lots of info on all the properties and attributes found on the web platform. It includes data on HTML, SVG, ARIA, XML, XMLNS, and XLink. The names of the properties follow hast’s sensible naming scheme. It includes info on what data types attributes hold, such as whether they’re booleans or contain lists of space separated numbers.
>
> When should I use this?
> You can use this package if you’re working with hast, which is an AST for HTML, or have goals related to ASTs, such as figuring out which properties or attributes are valid, or what data types they hold.

Ok, whatever, I actually have no idea of what this does, but it works, so let's implement the fix:

In our MdPage component just add

```ts
import 'property-information';
```

And eventually also add this to your `package.json`

```json
"@parcel/resolver-default": {
  "packageExports": true
}
```

And this should definetely fix the issue with react-markdown on parcel.

![catjam](./catjam-cat.gif)

## Extra: tailwindcss styles

Ok, this is actually not related with the issue described, but in case you use tailwindcss don't forget to remove the tailwindcss styles from the markdown.

Just add a `markdown` class to `ReactMarkdown` and add this rule to your css:

```css
.markdown > * {
  all: revert;
  overflow-x: hidden;
}
```
