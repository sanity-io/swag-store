export function setMarketoValue(key: string, value: any, expiration?: number) {
    if (expiration) {
      const now = new Date().getTime()
      const item = JSON.stringify({ value, expiration: now + expiration })
      localStorage.setItem(key, item)
      return
    }
  
    if (value === null || value === undefined) {
      localStorage.removeItem(key)
      return
    }
  
    localStorage.setItem(key, value)
  }
  
  export function getMarketoValue(key: string) {
    const raw = localStorage.getItem(key)
  
    if (!raw) return null
  
    let value: any
  
    try {
      value = JSON.parse(raw)
    } catch (_) {
      value = raw
    }
  
    if (typeof value?.expiration === "number") {
      return new Date().getTime() < value.expiration ? value.value : null
    }
  
    return value
  }
  
  export function getMarketoKey(key: string) {
    switch (key) {
      case "uTMSource":
        return "utm_source"
      case "uTMMedium":
        return "utm_medium"
      case "uTMCampaign":
        return "utm_campaign"
      case "UTM_Term__c":
        return "utm_term"
      case "utm_content":
        return "utm_content"
      case "Most_Recent_Website_Referrer_URL__c":
        return "most_recent_website_referrer_url"
      case "Most_Recent_Referrer_URL__c":
        return "most_recent_referrer_url"
      case "Website_Form_Submission_URL__c":
        return "website_form_submission_url"
      default:
        return
    }
  }