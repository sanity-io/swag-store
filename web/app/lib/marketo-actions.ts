

export type ActionState = {
  id?: number
  payload?: Record<string, string>
  errors?: Record<string, string>
  message?: string
  success?: boolean
}
