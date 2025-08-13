import {ActionFunctionArgs} from '@remix-run/server-runtime';
import {createMarketoClient} from '~/lib/marketo-api';
import {validateFields} from '~/lib/validate-fields';
import {getFormPayload} from '~/lib/get-form-payload';
import {prepareMarketoData} from '~/lib/marketo-rename';

export type ActionState = {
  id?: number;
  payload?: Record<string, string>;
  errors?: Record<string, string>;
  message?: string;
  success?: boolean;
};

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const formId = formData.get('formId')?.toString();
  const payload = getFormPayload(formData);
  let message: string | undefined;

  const marketo = createMarketoClient({
    MARKETO_CLIENT_ID: context.env.MARKETO_CLIENT_ID,
    MARKETO_CLIENT_SECRET: context.env.MARKETO_CLIENT_SECRET,
    MARKETO_ENDPOINT: context.env.MARKETO_ENDPOINT,
    MARKETO_IDENTITY: context.env.MARKETO_IDENTITY,
  });

  if (!formId) {
    message = 'Missing formId';
  }

  const fields = await marketo.getFormFields(formId);

  if (!fields) {
    message = 'No fields found for formId';
  }

  const errors = validateFields(fields, formData);

  if (!formId || !fields || errors || message) {
    return {
      id: Date.now(),
      errors,
      message,
      payload,
      success: false,
    };
  }

  const response = await marketo.submitForm({
    formId: Number(formId),
    input: [
      {
        leadFormFields: prepareMarketoData(fields, payload),
      },
    ],
  });

  if (!response.success) {
    console.error({
      payload,
      response,
    });
  }

  return {
    id: Date.now(),
    payload,
    success: response.success,
    message: !response.success ? 'Error submitting form' : undefined,
  };
}