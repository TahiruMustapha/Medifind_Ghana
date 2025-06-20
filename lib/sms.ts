import { validateEnv } from "@/helpers/validateEnv";
import { Resend } from "resend";

validateEnv();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  message: string,
  isHtml: boolean = false
): Promise<boolean> {
  try {
    const baseOptions = {
      from: "Acme <onboarding@resend.dev>", // Replace with your verified domain
      to,
      subject,
    };

    // Type-safe conditional email content
    const emailOptions = isHtml
      ? { ...baseOptions, html: message }
      : { ...baseOptions, text: message };

    const { error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

//SEND SMS WITH MNOTIFY
// Configure mNotify credentials
const mNotifyConfig = {
  apiKey: process.env.YOUR_MNOTIFY_API_KEY!,
  senderID: process.env.MNOTIFY_SENDERID,
  smsEndpoint: process.env.MNOTIFY_SMS_ENDPOINT,
};

type SMSResponse = {
  status: string;
  message: string;
};

export async function sendSMS(
  phoneNumber: string,
  message: string
): Promise<SMSResponse> {
  const url = `${mNotifyConfig.smsEndpoint}?key=${mNotifyConfig.apiKey}`;
  const cleanedPhoneNumber = String(phoneNumber).trim();

  if (!cleanedPhoneNumber || cleanedPhoneNumber.length < 10) {
    console.error(" Invalid phone number:", cleanedPhoneNumber);
    throw new Error("Invalid phone number provided");
  }
  const payload = {
    recipient: [cleanedPhoneNumber],
    sender: mNotifyConfig.senderID,
    message,
    is_schedule: "false",
    schedule_date: "",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MNotify error response:", errorText);
      throw new Error(`Failed to send SMS. Status: ${response.status}`);
    }

    const result = await response.json();
    return result as SMSResponse;
  } catch (error: any) {
    console.error("Error sending SMS:", error.message);
    throw error;
  }
}

// export async function findMedicineResponse(
//   medicineName: string,
//   location: string | null,
//   userPhoneNumber?: string // Add phone number parameter
// ) {
//   try {
//     const { db } = await import("@/lib/mongodb").then((mod) =>
//       mod.connectToMongoDB()
//     );

//     const query = { name: { $regex: medicineName, $options: "i" } };
//     const medicines = await db
//       .collection("medicines")
//       .aggregate([
//         { $match: query },
//         {
//           $lookup: {
//             from: "pharmacies",
//             localField: "availability.pharmacyId",
//             foreignField: "_id",
//             as: "pharmacyDetails",
//           },
//         },
//       ])
//       .toArray();

//     let responseMessage: string;

//     if (medicines.length === 0) {
//       responseMessage = `No results found for ${medicineName}`;
//     } else {
//       const availableAt: string[] = [];

//       for (const medicine of medicines) {
//         for (let i = 0; i < (medicine.availability?.length || 0); i++) {
//           const avail = medicine.availability[i];
//           const pharmacy = medicine.pharmacyDetails.find(
//             (p: any) => p._id.toString() === avail.pharmacyId.toString()
//           );
//           if (
//             avail.instock &&
//             pharmacy &&
//             (!location || pharmacy.location.toUpperCase().includes(location))
//           ) {
//             availableAt.push(`${pharmacy.name} (${pharmacy.contactNumber})`);
//             if (availableAt.length >= 3) break;
//           }
//         }
//       }

//       responseMessage =
//         availableAt.length === 0
//           ? `${medicineName} is currently out of stock in ${
//               location || "all locations"
//             }`
//           : `${medicineName} available at: ${availableAt.join(", ")}`;
//     }

//     // Send SMS if phone number provided
//     if (userPhoneNumber) {
//       await sendSMS(userPhoneNumber, responseMessage);
//     }
//     return responseMessage;
//   } catch (error) {
//     console.error("Error processing medicine search:", error);
//     const errorMessage =
//       "Sorry, we encountered an error processing your request. Please try again later.";

//     if (userPhoneNumber) {
//       await sendSMS(userPhoneNumber, errorMessage);
//     }

//     return errorMessage;
//   }
// }

/**
 * Generate a response for a medicine search query
 * @param medicineName Name of the medicine to find
 * @param location Optional location to filter by
 * @returns Formatted response text
 */
async function findMedicineResponse(
  medicineName: string,
  location: string | null
) {
  try {
    const { db } = await import("@/lib/mongodb").then((mod) =>
      mod.connectToMongoDB()
    );

    const query = { name: { $regex: medicineName, $options: "i" } };

    const medicines = await db
      .collection("medicines")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "pharmacies",
            localField: "availability.pharmacyId",
            foreignField: "_id",
            as: "pharmacyDetails",
          },
        },
      ])
      .toArray();

    if (medicines.length === 0) {
      return `No results found for ${medicineName}`;
    }

    // Filter by location if provided
    const availableAt = [];

    for (const medicine of medicines) {
      for (let i = 0; i < medicine.availability?.length || 0; i++) {
        const avail = medicine.availability[i];
        const pharmacy = medicine.pharmacyDetails.find(
          (p: any) => p._id.toString() === avail.pharmacyId.toString()
        );

        if (
          avail.inStock &&
          pharmacy &&
          (!location || pharmacy.location.toUpperCase().includes(location))
        ) {
          availableAt.push(`${pharmacy.name} (${pharmacy.contactNumber})`);

          // Limit to 3 results for SMS
          if (availableAt.length >= 3) break;
        }
      }
    }

    if (availableAt.length === 0) {
      return `${medicineName} is currently out of stock in ${location || "all locations"}`;
    } else {
      return `${medicineName} available at: ${availableAt.join(", ")}`;
    }
  } catch (error) {
    console.error("Error processing medicine search:", error);
    return "Sorry, we encountered an error processing your request. Please try again later.";
  }
}

export async function sendVerification(
  data: { phoneNumber?: string; email?: string },
  verificationCode: string
): Promise<{ smsSuccess: boolean; emailSuccess: boolean }> {
  const results = { smsSuccess: false, emailSuccess: false };

  // Prepare the common message content
  const verificationMessage = `Your verification code is: ${verificationCode}. This code expires in 24 hours.`;
  const htmlEmailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #2563eb;">Verification Code</h2>
      <p>Your verification code is: <strong style="font-size: 1.2em;">${verificationCode}</strong></p>
      <p>This code will expire in 24 hours.</p>
      <p style="color: #6b7280; font-size: 0.9em;">
        If you didn't request this, please ignore this message.
      </p>
    </div>
  `;

  // Send via both channels in parallel for better performance
  try {
    await Promise.all([
      // SMS delivery if phone number exists
      data.phoneNumber
        ? (async () => {
            try {
              const smsResponse = await sendSMS(
                data.phoneNumber!,
                verificationMessage
              );
              results.smsSuccess = smsResponse.status === "success";
            } catch (smsError) {
              console.error("SMS delivery failed:", smsError);
            }
          })()
        : Promise.resolve(),

      // Email delivery if email exists
      data.email
        ? (async () => {
            try {
              results.emailSuccess = await sendEmail(
                data.email!,
                "Your Verification Code",
                htmlEmailContent,
                true
              );
            } catch (emailError) {
              console.error("Email delivery failed:", emailError);
            }
          })()
        : Promise.resolve(),
    ]);
  } catch (error) {
    console.error("Error in verification delivery:", error);
  }

  return results;
}

/**
 * Process an incoming SMS query and generate a response
 * @param query The SMS query text
 * @returns Formatted response text
 */
export async function processSMSQuery(query: string) {
  // Parse the SMS command
  // Format examples:
  // FIND PARACETAMOL ACCRA
  // UPDATE PARACETAMOL YES PHARMACY_ID

  const parts = query.trim().toUpperCase().split(" ");
  const command = parts[0];

  if (command === "FIND" && parts.length >= 2) {
    const medicineName = parts[1];
    const location = parts.length >= 3 ? parts[2] : null;

    return await findMedicineResponse(medicineName, location);
  } else if (command === "UPDATE" && parts.length >= 4) {
    // This would require authentication in a real system
    return "Update feature coming soon. Please use the web app for now.";
  } else {
    return "Invalid command. Use FIND [MEDICINE] [LOCATION] or UPDATE [MEDICINE] [YES/NO] [PHARMACY_ID]";
  }
}
