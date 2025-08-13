export function getFormPayload(formData: FormData) {
    const result: Record<string, string> = {}
  
    Array.from(formData.entries()).forEach(([key, value]) => {
      if (value instanceof File) return
      result[key] = value
    })
  
    return result
  }