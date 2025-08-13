export type MarketoFormDatatype =
  | "text"
  | "email"
  | "url"
  | "phone"
  | "telephone"
  | "select"
  | "checkbox"
  | "textArea"
  | "hidden"

export type Autofill = {
  value: string
  valueFrom: string
  parameterName?: string
}

export type VisibilityRules = {
  rules?: VisibilityRule[]
  ruleType: "show" | "alwaysShow"
}

export type VisibilityRule = {
  subjectField: string
  operator:
    | "is"
    | "isNot"
    | "isEmpty"
    | "isNotEmpty"
    | "contains"
    | "notContains"
  values?: string[]
  altLabel: string
}

export type MarketoBaseField = {
  id: string
  dataType: MarketoFormDatatype
  defaultValue?: string
  hintText?: string
  label?: string
  required: boolean
  validationMessage?: string
  autoFill?: Autofill
  visibilityRules?: VisibilityRules
}

export type MarketoTextField = MarketoBaseField & {
  dataType: "text"
  maxLength?: number
}

export type MarketoTextAreaField = MarketoBaseField & {
  dataType: "textArea"
  maxLength?: number
}

export type MarketoEmailField = MarketoBaseField & {
  dataType: "email"
  maxLength?: number
}

export type MarketoPhoneField = MarketoBaseField & {
  dataType: "phone"
  maxLength?: number
}

export type MarketoTelephoneField = MarketoBaseField & {
  dataType: "telephone"
  maxLength?: number
}

export type MarketoUrlField = MarketoBaseField & {
  dataType: "url"
  maxLength?: number
}

export type MarketoSelectValue = {
  label: string
  value: string
  selected?: boolean
  isDefault?: boolean
}

export type FieldMetaData = {
  values?: MarketoSelectValue[]
}

export type MarketoSelectField = MarketoBaseField & {
  dataType: "select"
  fieldMetaData: FieldMetaData
}

export type CheckboxFieldMetaData = {
  initiallyChecked: boolean
}

export type MarketoCheckboxField = MarketoBaseField & {
  dataType: "checkbox"
  fieldMetaData: CheckboxFieldMetaData
}

export type MarketoHiddenField = MarketoBaseField & {
  dataType: "hidden"
}

export type MarketoField =
  | MarketoTextField
  | MarketoEmailField
  | MarketoUrlField
  | MarketoPhoneField
  | MarketoTelephoneField
  | MarketoSelectField
  | MarketoCheckboxField
  | MarketoTextAreaField
  | MarketoHiddenField