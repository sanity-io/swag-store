import {PortableText, PortableTextBlock} from '@portabletext/react';
import {portableRichText} from '~/serializers/richText';
import SanityImage from '~/components/SanityImage';

export const Collaborators = ({items}: {items: any[]}) => {
  return (
    <div className="bg-black">
      <div className="p-4 text-white">
        <span className="text-14 uppercase">Collaborations</span>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 800:grid-cols-2 gap-[100px] p-6 800:p-[100px]">
          {items.map((collaboration) => (
            <div key={collaboration._key} className="bg-black p-4 w-full">
              <SanityImage
                image={collaboration.image}
                alt={collaboration.name}
                className="w-full h-auto"
                width={300}
                height={300}
              />
              <div className="flex flex-col gap-2 my-4">
                <span className="text-14 uppercase">{collaboration.name}</span>
                <PortableText
                  value={collaboration.description}
                  components={portableRichText}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
