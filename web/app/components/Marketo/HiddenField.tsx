import {getMarketoKey, getMarketoValue} from '../../lib/marketo-tracking';
import {type MarketoHiddenField} from '../../lib/marketo.types';

import {analyticsClient} from '@sanity/frontend-analytics';
import {useSearchParams} from 'react-router';
import {useEffect, useState} from 'react';

type Props = {
  defaultValue?: string;
  field: MarketoHiddenField;
};

export function HiddenField({field, defaultValue}: Props) {
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(defaultValue || '');

  useEffect(() => {
    if (!field.autoFill?.parameterName) return;
    if (field.autoFill?.valueFrom !== 'query') return;
    const value = searchParams.get(field.autoFill.parameterName);
    if (value) setValue(value);
  }, [field, searchParams]);

  useEffect(() => {
    const key = getMarketoKey(field.id);
    if (!key) return;

    setTimeout(() => {
      setValue(getMarketoValue(key) ?? '');
    }, 100);
  }, [field.id]);

  useEffect(() => {
    if (field.id === 'anonymousId')
      analyticsClient.ready().then(() => {
        setValue(analyticsClient.getAnonymousId() || '');
      });
  }, [field]);

  return <input type="hidden" name={field.id} value={value} />;
}
