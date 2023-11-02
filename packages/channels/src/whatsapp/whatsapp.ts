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
    statuses?: WhatsappStatus[]
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
  text?: WhatsappText
}

export interface WhatsappStatus {
  id: string
  status: string
  timestamp: string
  recipient_id: string
  conversation?: {
    id: string
    expiration_timestamp: string
    origin: {
      type: string
    }
  }
  pricing?: {
    billable: boolean
    pricing_model: string
    category: string
  }
}

export interface WhatsappText {
  preview_url?: boolean
  body: string
}
