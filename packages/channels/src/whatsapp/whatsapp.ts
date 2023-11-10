export interface WhatsappPhoneNumberInfo {
  verified_name: string
  code_verification_status: string
  display_phone_number: string
  quality_rating: string
  platform_type: string
  throughput: {
      level: string
  }
  id: string
}

export interface WhatsappPayload {
  object: string
  entry: WhatsappEntry[]
}

export interface WhatsappEntry {
  id: string
  changes: WhatsappChange[]
}

export interface WhatsappChange {
  value: {
    messaging_product: string
    metadata: {
      display_phone_number: string
      phone_number_id: string
    }
    contacts: WhatsappContact[]
    messages?: WhatsappMessage[]
  }
  field: string
}

export interface WhatsappContact {
  profile: {
    name: string
  }
  wa_id: string
}

export interface WhatsappMessage {
  from: string
  id: string
  timestamp: string
  type: string
  text?: {
    preview_url?: boolean
    body: string
  }
  interactive?: {
    type: string
    button_reply?: {
      id: string
      title: string
    }
    list_reply?: {
      id: string
      title: string
    }
  }
}
