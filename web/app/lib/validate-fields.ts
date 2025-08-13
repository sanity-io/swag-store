import { MarketoField } from "./marketo.types"

export function validateFields(fields?: MarketoField[], formData?: FormData) {
  if (!fields) return
  if (!formData) return

  const errors: Record<string, string> = {}

  fields.forEach((field) => {
    const value = formData.get(field.id)?.toString().trim()

    if (field.required && !value) {
      errors[field.id] = "This field is required"
    } else if (field.dataType === "email" && value && !isValidEmail(value)) {
      errors[field.id] = "Please enter a valid email"
    }
  })

  return Object.keys(errors).length ? errors : undefined
}

function isValidEmail(value = "") {
  const regex =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/i
  return regex.test(value ?? "")
}