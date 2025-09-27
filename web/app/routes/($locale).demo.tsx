import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import cx from 'classnames';
import {useLoaderData, type MetaFunction} from 'react-router';
import {useState, useEffect} from 'react';

export const meta: MetaFunction = () => {
  return [{title: 'Sanity Market | Demo'}];
};

export async function loader(args: LoaderFunctionArgs) {
  return {};
}

export default function CanvasDemo() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Loading WHAT IS HAPPENING...
          </h1>
        </div>
      </div>
    );
  }

  return <div className="w-full h-screen">TEST</div>;
}
