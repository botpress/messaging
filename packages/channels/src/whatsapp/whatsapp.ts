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

export interface WhatsappContact {
  profile: {
    name: string
  }
  wa_id: string
}

export interface WhatsappPayload {
  object: string
  entry: WhatsappEntry[]
}

export interface WhatsappEntry {
  id: string
  changes: WhatsappChange[]
}

export interface WhatsappIncomingMessage {
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

export interface WhatsappChange {
  value: {
    messaging_product: string
    metadata: {
      display_phone_number: string
      phone_number_id: string
    }
    contacts: WhatsappContact[]
    messages?: WhatsappIncomingMessage[]
  }
  field: string
}


export interface WhatsappText {
  preview_url?: boolean
  body: string
}

export interface WhatsappMedia {
  link: string
  caption?: string
}

export interface WhatsappLocation {
  longitude: number
  latitude: number
  name?: string
  address?: string
}

export interface WhatsappButton {
  type: 'reply'
  reply: {
    id: string
    title: string
  }
}

export interface WhatsappRow {
  id: string
  title: string
}

export interface WhatsappSection {
  rows: WhatsappRow[]
}

export interface WhatsappInteractive {
  type: 'button' | 'list'
  header?: {
    type: 'text' | 'image' | 'video' | 'document'
    text?: string
    image?: WhatsappMedia
    video?: WhatsappMedia
    document?: WhatsappMedia
  }
  body?: {
    text: string
  }
  footer?: {
    text: string
  }
  action: {
    button?: string
    buttons?: WhatsappButton[]
    sections?: WhatsappSection[]
  }
}

export interface WhatsappOutgoingMessage {
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'interactive'
  text?: WhatsappText
  image?: WhatsappMedia
  audio?: WhatsappMedia
  video?: WhatsappMedia
  document?: WhatsappMedia
  location?: WhatsappLocation
  interactive?: WhatsappInteractive
}
