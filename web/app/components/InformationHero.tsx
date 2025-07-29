import {PortableText} from '@portabletext/react';
import {portableRichText} from '~/serializers/richText';

export function InformationHero({
  subtitle,
  header,
  content,
}: {
  subtitle: string;
  header: string;
  content: any;
}) {
  return (
    <div className="bg-brand-green min-h-[calc(100vh-40px)]">
      <div className="grid grid-cols-1 800:grid-cols-3 min-h-[calc(100vh)] gap-4">
        <div
          className="col-span-1"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '482px 444px',
            backgroundRepeat: 'repeat',
          }}
        >
          <div className="aspect-video w-full bg-brand-green mt-20">
            <div className="flex flex-col items-center justify-center h-full">
              <span className="font-mono font-normal text-14 uppercase">
                {subtitle}
              </span>
            </div>
          </div>
          <div className="min-w-[80vw] mt-2 p-4"></div>
        </div>
        <div
          className="col-span-2 800:grid-cols-2 flex flex-col justify-between"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '482px 444px',
            backgroundRepeat: 'repeat',
          }}
        >
          <div className="mt-20 p-4">
            <h1 className="font-sans !mt-0 font-normal text-56 leading-none ">
              {header}
            </h1>
          </div>
          <div className="grid grid-cols-1 800:grid-cols-2 mb-[40px]">
            <div className="col-span-1 col-start-2 bg-brand-green p-4">
              <div>
                <PortableText value={content} components={portableRichText} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
