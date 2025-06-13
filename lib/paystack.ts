interface PaystackInitializeResponse {
    status: boolean
    message: string
    data: {
      authorization_url: string
      access_code: string
      reference: string
    }
  }
  
  interface PaystackVerifyResponse {
    status: boolean
    message: string
    data: {
      id: number
      domain: string
      status: string
      reference: string
      amount: number
      message: string | null
      gateway_response: string
      paid_at: string
      created_at: string
      channel: string
      currency: string
      ip_address: string
      metadata: any
      log: any
      fees: number
      fees_split: any
      authorization: {
        authorization_code: string
        bin: string
        last4: string
        exp_month: string
        exp_year: string
        channel: string
        card_type: string
        bank: string
        country_code: string
        brand: string
        reusable: boolean
        signature: string
        account_name: string | null
      }
      customer: {
        id: number
        first_name: string | null
        last_name: string | null
        email: string
        customer_code: string
        phone: string | null
        metadata: any
        risk_action: string
        international_format_phone: string | null
      }
      plan: any
      split: any
      order_id: any
      paidAt: string
      createdAt: string
      requested_amount: number
      pos_transaction_data: any
      source: any
      fees_breakdown: any
    }
  }
  
  class PaystackService {
    private secretKey: string
    private baseUrl: string
  
    constructor() {
      this.secretKey = process.env.PAYSTACK_SECRET_KEY!
      this.baseUrl = "https://api.paystack.co"
    }
  
    async initializeTransaction(data: {
      email: string
      amount: number
      reference: string
      callback_url?: string
      metadata?: any
    }): Promise<PaystackInitializeResponse> {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          amount: data.amount * 100, // Convert to kobo
        }),
      })
  
      if (!response.ok) {
        throw new Error(`Paystack API error: ${response.statusText}`)
      }
  
      return response.json()
    }
  
    async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      })
  
      if (!response.ok) {
        throw new Error(`Paystack API error: ${response.statusText}`)
      }
  
      return response.json()
    }
  
    async refundTransaction(reference: string, amount?: number): Promise<any> {
      const response = await fetch(`${this.baseUrl}/refund`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transaction: reference,
          amount: amount ? amount * 100 : undefined, // Convert to kobo if provided
        }),
      })
  
      if (!response.ok) {
        throw new Error(`Paystack API error: ${response.statusText}`)
      }
  
      return response.json()
    }
  
    generateReference(): string {
      return `MF_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    }
  }
  
  export const paystackService = new PaystackService()
  