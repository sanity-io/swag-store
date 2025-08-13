'use client';

import {MarketoField} from '../lib/marketo.types';
import {Suspense, useState, useCallback} from 'react';
import {TextField} from './Marketo/TextField';
import {TextareaField} from './Marketo/TextareaField';
import {CheckboxField} from './Marketo/CheckboxField';
import {HiddenField} from './Marketo/HiddenField';
import clsx from 'clsx';
import {ActionState} from '../lib/marketo-actions';
import {validateFields} from '../lib/validate-fields';
import {getFormPayload} from '../lib/get-form-payload';
import {useNavigate} from 'react-router';
type Props = {
  fields: MarketoField[];
  className?: string;
  formId: string;
};

const initialState: ActionState = {};

export function MarketoForm(props: Props) {
  const navigate = useNavigate();
  const [state, setState] = useState<ActionState>(initialState);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitAction = useCallback(
    async (formData: FormData) => {
      setPending(true);
      try {
        const errors = validateFields(props.fields, formData);
        const payload = getFormPayload(formData);

        if (errors) {
          setState({
            errors,
            payload,
            id: Date.now(),
            success: false,
          });
          return;
        }

        const response = await fetch('/marketo', {
          method: 'POST',
          body: formData,
        });

        const data = (await response.json()) as ActionState;

        setState(data);

        if (data.success) {
          setSuccess(true);
        }
      } finally {
        setPending(false);
      }
    },
    [props.fields, navigate, state],
  );

  const action = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      submitAction(formData);
    },
    [submitAction],
  );

  return (
    <>
      {success ? (
        <div>
          <h1>Thank you for subscribing!</h1>
        </div>
      ) : (
        <form
          className={clsx(props.className, 'grid gap-y-8')}
          onSubmit={action}
          key={state.id}
          noValidate
        >
          <input type="hidden" name="formId" value={props.formId} />
          {props.fields.map((field) => (
            <Suspense key={field.id}>
              {field.dataType === 'hidden' && (
                <HiddenField
                  field={field}
                  defaultValue={state.payload?.[field.id]}
                />
              )}
              {field.dataType === 'textArea' && (
                <TextareaField
                  field={field}
                  defaultValue={state.payload?.[field.id]}
                  defaultError={state.errors?.[field.id]}
                />
              )}
              {field.dataType === 'checkbox' && (
                <CheckboxField
                  field={field}
                  defaultValue={state.payload?.[field.id]}
                  defaultError={state.errors?.[field.id]}
                />
              )}
              {field.dataType === 'email' && (
                <TextField
                  field={field}
                  defaultValue={state.payload?.[field.id]}
                  defaultError={state.errors?.[field.id]}
                />
              )}
              {field.dataType === 'phone' && (
                <TextField
                  field={field}
                  defaultValue={state.payload?.[field.id]}
                  defaultError={state.errors?.[field.id]}
                />
              )}
              {field.dataType === 'telephone' && (
                <TextField
                  field={field}
                  defaultValue={state.payload?.[field.id]}
                  defaultError={state.errors?.[field.id]}
                />
              )}
              {field.dataType === 'text' && (
                <TextField
                  field={field}
                  defaultValue={state.payload?.[field.id]}
                  defaultError={state.errors?.[field.id]}
                />
              )}
              {field.dataType === 'url' && (
                <TextField
                  field={field}
                  defaultValue={state.payload?.[field.id]}
                  defaultError={state.errors?.[field.id]}
                />
              )}
            </Suspense>
          ))}
          <button
            className="text-interactive-md bg-brand-yellow hover:text-brand rounded-full px-64 py-16 text-black hover:bg-white md:w-fit"
            disabled={pending}
          >
            {pending ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}
    </>
  );
}
