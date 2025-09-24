import {type MetaFunction} from 'react-router';
import {Newsletter} from '~/components/Newsletter';

export const meta: MetaFunction = () => {
  return [{title: 'Subscribe | Sanity Market'}];
};

export default function Subscribe() {
  return (
    <div className="w-full h-screen bg-brand-green">
      <div className="w-full p-8">
        <h1 className="font-sans !mt-0 font-normal text-56 leading-none ">
          Join our community newsletter
        </h1>
      </div>
      <div className="w-full p-8">
        <Newsletter
          className="mt-24 w-full max-w-md"
          title="Stay in the loop"
          description="Get notified when new products drop and exclusive offers."
          showMarketingOptIn={true}
        />
      </div>
    </div>
  );
}
