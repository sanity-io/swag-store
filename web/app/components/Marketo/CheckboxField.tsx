import {type MarketoCheckboxField} from '@/app/_lib/marketo.types';
import {Optional} from '@/app/_lib/optional';
import {useEffect, useRef, useState} from 'react';

type Props = {
  payload?: Record<string, string>;
  defaultError?: Optional<string>;
  defaultValue?: boolean | string;
  field: MarketoCheckboxField;
};

export function CheckboxField({field, defaultError, defaultValue}: Props) {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(defaultError);
  const errorId = field.id + 'Error';

  useEffect(() => {
    setError(defaultError);
  }, [defaultError]);

  useEffect(() => {
    if (!defaultValue) return;
    setChecked(defaultValue === 'on');
  }, [defaultValue]);

  return (
    <div className="relative grid grid-cols-[auto_1fr] gap-x-2">
      <input
        className="border-gray-deep h-6 w-6 appearance-none border hover:border-white focus:border-white focus:outline-1 focus:outline-white"
        type="checkbox"
        name={field.id}
        id={field.id}
        aria-describedby={errorId}
        aria-invalid={!!error}
        checked={checked}
        onChange={(event) => {
          setError(undefined);
          setChecked(event.target.checked);
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 hidden h-6 w-6 items-center justify-center font-sans text-[20px] [:checked+&]:flex"
      >
        ✓
      </span>
      <label className="text-label-md ml-2" htmlFor={field.id}>
        {field.label}
      </label>
      {!!error && (
        <p
          className="text-details-md col-span-full mt-4 text-[#f77769] empty:hidden"
          aria-live="polite"
          id={errorId}
        >
          * {error}
        </p>
      )}
    </div>
  );
}
