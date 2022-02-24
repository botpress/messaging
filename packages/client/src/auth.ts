export interface MessagingClientAuth {
  /** Token to send requests */
  clientToken?: string
  /** Token to validate webhook requests */
  webhookToken?: string
}
