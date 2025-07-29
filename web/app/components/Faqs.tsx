'use client';

import {PortableText} from '@portabletext/react';
import {portableRichText} from '~/serializers/richText';
import {useState} from 'react';
import clsx from 'clsx';

interface Question {
  _key: string;
  question: string;
  answer: any;
}

interface FaqsProps {
  questions: Question[];
  subtitle?: string;
  description?: any;
}

const Plus = () => (
  <svg
    width="31"
    height="31"
    viewBox="0 0 31 31"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_348_733)">
      <path
        d="M4.84375 15.5H26.1562"
        stroke="black"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 4.84375V26.1562"
        stroke="black"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_348_733">
        <rect width="31" height="31" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const Faqs = ({questions, subtitle, description}: FaqsProps) => {
  const [openItems, setOpenItems] = useState<{[key: string]: boolean}>({});

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-gray min-h-[800px] flex flex-col">
      <div className="grid grid-cols-1 800:grid-cols-3 h-full gap-4 flex-1">
        <div className="col-span-2 p-4">
          <span>FAQ</span>
          <div className="mt-[200px]">
            {questions.map((question) => (
              <div key={question._key} className="border-b border-black">
                <button
                  onClick={() => toggleItem(question._key)}
                  className="w-full inline-flex  text-left items-center justify-between py-4 px-0 focus:outline-none"
                >
                  <h3 className="text-30 font-sans">{question.question}</h3>
                  <div
                    className={clsx(
                      'transform duration-300',
                      openItems[question._key] && 'rotate-[45deg]',
                    )}
                  >
                    <Plus />
                  </div>
                </button>
                {openItems[question._key] && (
                  <div className="pb-4">
                    <PortableText
                      value={question.answer}
                      components={portableRichText}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div>
            <PortableText value={description} components={portableRichText} />
          </div>
        </div>
        <div
          className="col-span-1 hidden 800:block"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '482px 444px',
            backgroundRepeat: 'repeat',
          }}
        ></div>
      </div>
    </div>
  );
};
