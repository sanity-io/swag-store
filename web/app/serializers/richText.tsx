'use client';

import {LocalizedLink} from '~/components/LocalizedLink';

const Marks = {
  strong: ({children}: {children: React.ReactNode}) => (
    <strong className="font-700">{children}</strong>
  ),
  em: ({children}: {children: React.ReactNode}) => (
    <em className="font-serif">{children}</em>
  ),

  link: ({value, children}) => {
    const {href} = value;
    if (href.startsWith('http') || href.startsWith('mailto')) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {children}
        </a>
      );
    }
    return <LocalizedLink to={href}>{children}</LocalizedLink>;
  },
};

export const portableTextFaq = {
  block: {
    h4: ({children}: {children: React.ReactNode}) => (
      <h4 className="text-sans-22 -tracking-1  font-sans 800:text-sans-32 800:-tracking-045 my-6">
        {children}
      </h4>
    ),
    mono: ({children}: {children: React.ReactNode}) => (
      <p className="font-mono uppercase text-mono-15 mb-6 tracking-1.5">
        {children}
      </p>
    ),
    normal: ({children}: {children: React.ReactNode}) => (
      <p className="text-[18px] 800:text-[22px] 800:leading-[24px]  my-4">
        {children}
      </p>
    ),
  },
  marks: Marks,
};

export const portableRichText = {
  block: {
    h1: ({children}: {children: React.ReactNode}) => (
      <h1 className="uppercase font-400">{children}</h1>
    ),
    h2: ({children}: {children: React.ReactNode}) => (
      <h2 className="font-sans outline-orange text-18 800:text-30 800:leading-[38px]">
        {children}
      </h2>
    ),
    h3: ({children}: {children: React.ReactNode}) => (
      <h3 className="text-30 font-sans">{children}</h3>
    ),
    h4: ({children}: {children: React.ReactNode}) => (
      <h4 className="text-sans-22 -tracking-1  font-sans 800:text-sans-32 800:-tracking-045 my-6">
        {children}
      </h4>
    ),
    h5: ({children}: {children: React.ReactNode}) => (
      <h5 className="uppercase font-400">{children}</h5>
    ),
    h6: ({children}: {children: React.ReactNode}) => (
      <h6 className="uppercase font-400">{children}</h6>
    ),
    mono: ({children}: {children: React.ReactNode}) => (
      <p className="font-mono uppercase text-mono-15 tracking-1.5">
        {children}
      </p>
    ),
    normal: ({children}: {children: React.ReactNode}) => (
      <p className="text-14 font-mono my-4 uppercase">{children}</p>
    ),
  },
  marks: Marks,
};
