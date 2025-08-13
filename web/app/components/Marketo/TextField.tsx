import type {
  MarketoEmailField,
  MarketoPhoneField,
  MarketoTelephoneField,
  MarketoTextField,
  MarketoUrlField,
} from '@/app/_lib/marketo.types';
import {useEffect, useState} from 'react';

type Props = {
  defaultValue?: string;
  defaultError?: string;
  field:
    | MarketoTextField
    | MarketoEmailField
    | MarketoPhoneField
    | MarketoTelephoneField
    | MarketoUrlField;
};

export function TextField({field, defaultError, defaultValue}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState(defaultError);
  const errorId = field.id + 'Error';

  useEffect(() => {
    setError(defaultError);
  }, [defaultError]);

  useEffect(() => {
    if (!defaultValue) return;
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="grid">
      <label className="text-label-md pb-4" htmlFor={field.id}>
        {field.label}
      </label>
      <input
        className="border-gray-deep border p-2 font-sans text-[64px] hover:border-white focus:border-white focus:outline-1 focus:outline-white"
        type={getInputType(field)}
        name={field.id}
        id={field.id}
        placeholder={field.hintText}
        aria-describedby={errorId}
        aria-invalid={!!error}
        value={value ?? ''}
        onChange={(event) => {
          setValue(event.target.value);
          setError(undefined);
        }}
      />
      {!!error && (
        <p
          className="text-details-md mt-4 text-[#f77769] empty:hidden"
          aria-live="polite"
          id={errorId}
        >
          * {error}
        </p>
      )}
    </div>
  );
}

function getInputType(field: Props['field']) {
  if (field.dataType === 'email') return 'email';
  if (field.dataType === 'phone') return 'tel';
  if (field.dataType === 'telephone') return 'tel';
  if (field.dataType === 'url') return 'url';
  return 'text';
}
