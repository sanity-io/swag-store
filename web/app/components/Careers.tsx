import {PortableText} from '@portabletext/react';
import {portableRichText} from '~/serializers/richText';

export const Careers = ({subtitle, body, cta}) => {
  return (
    <div
      className="bg-brand-orange
     flex flex-col"
    >
      <div className="grid grid-cols-1 800:grid-cols-3 h-full gap-4 flex-1">
        <div className="col-span-1 p-4 flex flex-col min-h-[300px] justify-between">
          <div>
            <span>{subtitle}</span>
            <div>
              <PortableText value={body} components={portableRichText} />
            </div>
          </div>
          <div>
            {cta && (
              <a
                className="border inline-block rounded-[30px] border-black p-2 px-4 uppercase"
                href={cta.url}
              >
                {cta.label}
              </a>
            )}
          </div>
        </div>
        <div
          className="col-span-1"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '482px 444px',
            backgroundRepeat: 'repeat',
          }}
        ></div>
        <div
          className="col-span-1"
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
