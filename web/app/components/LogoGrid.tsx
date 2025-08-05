import SanityImage from '~/components/SanityImage';

export const LogoGrid = ({title, items}: {title: string; items: any[]}) => {
  return (
    <div className="bg-black ">
      <div className="flex flex-col justify-between p-4">
        <span className="text-14 uppercase text-white text-center p-10">
          {title}
        </span>
      </div>
      <div
        className="grid grid-cols-2 800:grid-cols-3 gap-4 p-4 bg-gray/40"
        style={{
          backgroundImage: 'url(/images/grid-bg.png)',
          backgroundSize: '5px',
          backgroundRepeat: 'repeat',
        }}
      >
        {items.map(
          ({
            title,
            _key,
            image,
            url,
          }: {
            title: string;
            _key: string;
            image: any;
            url: string;
          }) => (
            <div
              key={_key}
              className="col-span-1 bg-black aspect-video flex items-center justify-center"
            >
              <div className="w-[70%] h-auto mx-auto">
                <SanityImage
                  image={image}
                  containerClasses="inline-flex items-center justify-center"
                  className="w-full h-auto object-contain"
                  alt={title}
                  width={100}
                  height={100}
                />
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};
