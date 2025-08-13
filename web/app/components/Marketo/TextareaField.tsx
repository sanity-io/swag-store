import {type MarketoTextAreaField} from '@/app/_lib/marketo.types';
import {Optional} from '@/app/_lib/optional';
import {useEffect, useState} from 'react';

type Props = {
  defaultValue?: string;
  defaultError?: Optional<string>;
  field: MarketoTextAreaField;
};

export function TextareaField({field, defaultError, defaultValue}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState(defaultError);
  const errorId = field.id + 'Error';

  useEffect(() => {
    setError(defaultError);
  }, [defaultError]);

  return (
    <div className="grid">
      <label className="text-label-md pb-12" htmlFor={field.id}>
        {field.label}
      </label>
      <textarea
        rows={1}
        className="[r] border-gray-deep min-h-[min-content] border p-12 font-sans text-[15px] hover:border-white focus:border-white focus:outline-1 focus:outline-white"
        name={field.id}
        id={field.id}
        placeholder={field.hintText}
        aria-describedby={errorId}
        aria-invalid={!!error}
        value={value}
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
