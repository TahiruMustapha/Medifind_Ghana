import axios from 'axios';

/**
 * Configuration for TextBee SMS service
 */
interface TextBeeConfig {
  apiKey: string;
  baseUrl?: string;
  deviceId?: string;
}

/**
 * Response from TextBee SMS API
 */
interface TextBeeResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  statusCode?: number;
}

/**
 * Options for sending SMS
 */
interface SendSMSOptions {
  to: string | string[];
  message: string;
  deviceId?: string;
  callbackUrl?: string;
  priority?: 'high' | 'normal' | 'low';
}

/**
 * TextBee SMS client for sending SMS messages
 */
export class TextBeeSMS {
  private config: TextBeeConfig;
  
  /**
   * Create a new TextBee SMS client
   * @param config Configuration for TextBee SMS service
   */
  constructor(config: TextBeeConfig) {
    this.config = {
      baseUrl: 'https://api.textbee.dev/api/v1',
      ...config
    };
    
    if (!this.config.apiKey) {
      throw new Error('TextBee API key is required');
    }
  }
  
  /**
   * Send an SMS message
   * @param options Options for sending SMS
   * @returns Promise with the result of the SMS sending operation
   */
  async sendSMS(options: SendSMSOptions): Promise<{ success: boolean; message?: string; data?: any; error?: string }> {
    try {
      // Validate required parameters
      if (!options.to) {
        return { success: false, error: 'Recipient phone number is required' };
      }
      
      if (!options.message) {
        return { success: false, error: 'Message content is required' };
      }
      
      // Use provided deviceId or default from config
      const deviceId = options.deviceId || this.config.deviceId;
      if (!deviceId) {
        return { success: false, error: 'Device ID is required. Provide it in the config or in the sendSMS options.' };
      }
      
      // Format phone numbers if an array is provided
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      // Format phone numbers (remove spaces, ensure proper format)
      const formattedRecipients = recipients.map(phone => this.formatPhoneNumber(phone));
      
      // Prepare request payload
      const payload = {
        to: formattedRecipients,
        message: options.message,
        callbackUrl: options.callbackUrl,
        priority: options.priority || 'normal'
      };
      
      // Send the request to TextBee API
      const response = await axios.post(
        `${this.config.baseUrl}/gateway/devices/${deviceId}/send-sms`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );
      
      // Handle successful response
      return {
        success: true,
        message: 'SMS sent successfully',
        data: response.data
      };
      
    } catch (error: any) {
      // Handle error response
      console.error('TextBee SMS Error:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send SMS',
        message: 'SMS sending failed'
      };
    }
  }
  
  /**
   * Send bulk SMS messages to multiple recipients
   * @param options Options for sending SMS
   * @returns Promise with the result of the bulk SMS sending operation
   */
  async sendBulkSMS(options: SendSMSOptions): Promise<{ success: boolean; message?: string; data?: any; error?: string }> {
    try {
      // Validate required parameters
      if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
        return { success: false, error: 'At least one recipient phone number is required' };
      }
      
      if (!options.message) {
        return { success: false, error: 'Message content is required' };
      }
      
      // Use provided deviceId or default from config
      const deviceId = options.deviceId || this.config.deviceId;
      if (!deviceId) {
        return { success: false, error: 'Device ID is required. Provide it in the config or in the sendBulkSMS options.' };
      }
      
      // Ensure recipients is an array
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      
      // Format phone numbers (remove spaces, ensure proper format)
      const formattedRecipients = recipients.map(phone => this.formatPhoneNumber(phone));
      
      // Prepare request payload
      const payload = {
        to: formattedRecipients,
        message: options.message,
        callbackUrl: options.callbackUrl,
        priority: options.priority || 'normal'
      };
      
      // Send the request to TextBee API
      const response = await axios.post(
        `${this.config.baseUrl}/gateway/devices/${deviceId}/send-bulk-sms`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );
      
      // Handle successful response
      return {
        success: true,
        message: 'Bulk SMS sent successfully',
        data: response.data
      };
      
    } catch (error: any) {
      // Handle error response
      console.error('TextBee Bulk SMS Error:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send bulk SMS',
        message: 'Bulk SMS sending failed'
      };
    }
  }
  
  /**
   * Helper function to format phone numbers
   * @param phone Phone number to format
   * @returns Formatted phone number
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code logic here if needed
    // For example, for Ghana numbers:
    if (!cleaned.startsWith('233') && cleaned.startsWith('0')) {
      cleaned = '233' + cleaned.substring(1);
    }
    
    return cleaned;
  }
}

/**
 * Simple function to send an SMS using TextBee
 * @param phoneNumber Recipient phone number
 * @param message SMS message content
 * @param apiKey TextBee API key
 * @param deviceId TextBee device ID
 * @returns Promise with the result of the SMS sending operation
 */
export async function sendSMS(
  phoneNumber: string,
  message: string,
  apiKey: string,
  deviceId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Check if API key is configured
    if (!apiKey) {
      console.error("TextBee API key not provided");
      return { success: false, message: "SMS service not configured" };
    }
    
    // Check if device ID is configured
    if (!deviceId) {
      console.error("TextBee device ID not provided");
      return { success: false, message: "SMS service not configured properly" };
    }
    
    // Create TextBee client
    const textbee = new TextBeeSMS({
      apiKey,
      deviceId
    });
    
    // Send SMS
    const result = await textbee.sendSMS({
      to: phoneNumber,
      message
    });
    
    return {
      success: result.success,
      message: result.message,
      error: result.error
    };
  } catch (error: any) {
    console.error("TextBee SMS Error:", error);
    return { 
      success: false, 
      message: `SMS sending failed: ${error.message || "Unknown error"}` 
    };
  }
}

// Example usage:
/*
// Using the class
const textbee = new TextBeeSMS({
  apiKey: process.env.TEXTBEE_API_KEY!,
  deviceId: process.env.TEXTBEE_DEVICE_ID
});

// Send a single SMS
const result = await textbee.sendSMS({
  to: '+233123456789',
  message: 'Hello from TextBee!'
});

// Send bulk SMS
const bulkResult = await textbee.sendBulkSMS({
  to: ['+233123456789', '+233987654321'],
  message: 'Hello from TextBee!'
});

// Using the simple function
const simpleResult = await sendSMS(
  '+233123456789',
  'Hello from TextBee!',
  process.env.TEXTBEE_API_KEY!,
  process.env.TEXTBEE_DEVICE_ID!
);
*/
