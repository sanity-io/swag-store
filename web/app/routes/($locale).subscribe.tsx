import {LoaderFunctionArgs, type MetaFunction} from 'react-router';

import {createMarketoClient} from '~/lib/marketo-api';
import {MarketoForm} from '~/components/MarketoForm';

export const meta: MetaFunction = () => {
  return [{title: 'Subscribe | Sanity Market'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  try {
    const marketo = createMarketoClient({
      MARKETO_CLIENT_ID: context.env.MARKETO_CLIENT_ID,
      MARKETO_CLIENT_SECRET: context.env.MARKETO_CLIENT_SECRET,
      MARKETO_ENDPOINT: context.env.MARKETO_ENDPOINT,
      MARKETO_IDENTITY: context.env.MARKETO_IDENTITY,
    });

    const fields = await marketo.getFormFields('1205');
    return {fields};
  } catch (error) {
    console.error('Error in subscribe loader:', error);
    // Return empty fields array on error so the page still renders
    return {fields: []};
  }
}

export default function Subscribe({loaderData}: {loaderData: {fields: any}}) {
  const {fields} = loaderData;

  return (
    <div className="w-full h-screen bg-brand-green">
      <div className="w-full p-8">
        <h1 className="font-sans !mt-0 font-normal text-56 leading-none ">
          Join our community newsletter
        </h1>
      </div>
      <div className="w-full p-8">
        <MarketoForm
          className="mt-24 w-full"
          fields={fields || []}
          formId={'1205'}
        />
      </div>
    </div>
  );
}
