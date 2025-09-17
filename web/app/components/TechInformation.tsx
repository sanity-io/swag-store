import {PortableText, PortableTextBlock} from '@portabletext/react';
import {portableRichText} from '~/serializers/richText';

import SanityImage from '~/components/SanityImage';

export function TechInformation({
  description,
  infoBlocks,
  subtitle,
}: {
  description?: PortableTextBlock[];
  infoBlocks: any;
  subtitle?: string;
}) {
  return (
    <div className="bg-gray">
      <div className="flex flex-col justify-between p-4">
        <h5 className="text-14 uppercase">{subtitle}</h5>
        <div className="mt-[180px]">
          {description && (
            <PortableText value={description} components={portableRichText} />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 800:grid-cols-3 gap-4">
        <div
          className="col-span-2 800:grid-cols-2 800:grid gap-4"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '5px',
            backgroundRepeat: 'repeat',
          }}
        >
          <div className="col-span-1 col-start-2 p-4 flex flex-col gap-4">
            {infoBlocks.map((block: any) => (
              <div key={block._key} className="bg-gray min-h-[140px] p-4 pb-1">
                <div className="max-w-[30px]">
                  <SanityImage
                    image={block.image}
                    alt={block.image.alt}
                    width={100}
                    maxWidth={80}
                  />
                </div>
                <div className="mt-[60px]">
                  <PortableText
                    value={block.content}
                    components={portableRichText}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="col-span-1 hidden 800:block"
          style={{
            backgroundImage: 'url(/images/grid-bg.png)',
            backgroundSize: '5px',
            backgroundRepeat: 'repeat',
          }}
        ></div>
      </div>
    </div>
  );
}
