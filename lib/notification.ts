import { sendSMS } from "./sms";

/**
 * Send a notification to a pharmacy when they are verified
 * @param phoneNumber Pharmacy phone number
 * @param pharmacyName Pharmacy name
 */
export async function sendPharmacyVerificationNotification(
  phoneNumber: string,
  pharmacyName: string
) {
  const message = `Congratulations! Your pharmacy "${pharmacyName}" has been verified on MediFind Ghana. You can now update your medicine inventory.`;
  try {
    await sendSMS(phoneNumber, message);
  } catch (error) {
    console.error("Failed to send verification notification:", error)
  }
}
