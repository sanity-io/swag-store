import { MarketoField } from "./marketo.types"
import { Optional } from "./optional"

function assertValue<T>(value: T | undefined, name: string): T {
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${name}`)
  }

  return value
}

// Remove direct process.env access and create a factory function
export function createMarketoClient(env: {
  MARKETO_CLIENT_ID: string;
  MARKETO_CLIENT_SECRET: string;
  MARKETO_ENDPOINT: string;
  MARKETO_IDENTITY: string;
}) {
  const clientId = assertValue(env.MARKETO_CLIENT_ID, "MARKETO_CLIENT_ID")
  const clientSecret = assertValue(env.MARKETO_CLIENT_SECRET, "MARKETO_CLIENT_SECRET")
  const endpointUrl = assertValue(env.MARKETO_ENDPOINT, "MARKETO_ENDPOINT")
  const identityUrl = assertValue(env.MARKETO_IDENTITY, "MARKETO_IDENTITY")

  type AccessToken = {
    access_token: string
    token_type: string
    expires_in: number
    scope: string
  }

  type MarketoResponse<T> = {
    result?: T
    errors: Array<{ code: string; message: string }>
    warnings: Array<any>
    requestId: string
    success: boolean
  }

  type MarketoFormRecord = {
    id: number
    name: string
  }

  async function getAccessToken() {
    const url = new URL(`${identityUrl}/oauth/token`)
    url.searchParams.append("grant_type", "client_credentials")
    url.searchParams.append("client_id", clientId)
    url.searchParams.append("client_secret", clientSecret)
    const response = await fetch(url.toString())
    return (await response.json()) as AccessToken
  }

  async function getForms() {
    const token = await getAccessToken()
    const response = await fetch(
      `${endpointUrl}/asset/v1/forms.json?maxReturn=100`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    )

    const data = (await response.json()) as MarketoResponse<
      Array<MarketoFormRecord>
    >
    return data.result ?? []
  }

  async function getFormFields(id: Optional<string>) {
    if (!id) return
    const token = await getAccessToken()
    const response = await fetch(
      `${endpointUrl}/asset/v1/form/${id}/fields.json`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    )

    const data = (await response.json()) as MarketoResponse<MarketoField[]>
    return data.result
  }

  type SubmitBody = {
    formId: number
    input: [
      {
        leadFormFields: Record<string, string | boolean>
        cookie?: string
        visitorData?: {
          pageURL?: string
          queryString?: string
          leadClientIpAddress?: string
          userAgentString?: string
        }
      },
    ]
  }

  async function submitForm(body: SubmitBody) {
    const { access_token } = await getAccessToken()
    const response = await fetch(`${endpointUrl}/v1/leads/submitForm.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return data as MarketoResponse<unknown>
  }

  return {
    getForms,
    getFormFields,
    submitForm
  }
}