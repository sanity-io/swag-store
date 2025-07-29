'use client';

import {Link} from 'react-router';

const Marks = {
  strong: ({children}: {children: React.ReactNode}) => (
    <strong className="font-700">{children}</strong>
  ),
  em: ({children}: {children: React.ReactNode}) => (
    <em className="font-serif">{children}</em>
  ),

  link: ({children, value}: {children: React.ReactNode; value?: any}) => {
    return (
      <Link
        className="underline"
        to={value?.href || '#'}
        target={value?.openInNewWindow ? '_blank' : '_self'}
      >
        {children}
      </Link>
    );
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
      <h2 className="font-cor uppercase outline-orange text-[36px] leading-[40px] 800:text-[48px] text-center 1000:text-[64px] 1000:leading-[68px]">
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
      <p className="text-14 font-mono my-4">{children}</p>
    ),
  },
  marks: Marks,
};
