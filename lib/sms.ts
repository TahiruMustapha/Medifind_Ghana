import { validateEnv } from "@/helpers/validateEnv";
// import africastalking from "africastalking";
import { Resend } from 'resend';
validateEnv();

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  message: string,
  isHtml: boolean = false
): Promise<boolean> {
  try {
    const baseOptions = {
      from: 'Acme <onboarding@resend.dev>', // Replace with your verified domain
      to,
      subject,
    };

    // Type-safe conditional email content
    const emailOptions = isHtml 
      ? { ...baseOptions, html: message }
      : { ...baseOptions, text: message };

    const { error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error('Resend error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// // Setup Africa's Talking
// const africasTalking = africastalking({
//   apiKey: process.env.apiKey as string, // e.g. "your-sandbox-api-key"
//   username: process.env.username as string, // usually "sandbox"
// });

// const sms = africasTalking.SMS;

// export async function sendSMS(to: string, message: string) {
//   try {
//     const formattedNumber = to.startsWith("+")
//       ? to
//       : `+233${to.replace(/^0/, "")}`;

//     const response = await sms.send({
//       to: [formattedNumber],
//       message,
//       from: "AFRICASTKNG", // Default sandbox sender
//     });

//     return response;
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     throw error;
//   }
// }

// /**
//  * Process an incoming SMS query and generate a response
//  * @param query The SMS query text
//  * @returns Formatted response text
//  */
// export async function processSMSQuery(query: string) {
//   const parts = query.trim().toUpperCase().split(" ");
//   const command = parts[0];

//   if (command === "FIND" && parts.length >= 2) {
//     const medicineName = parts[1];
//     const location = parts.length >= 3 ? parts[2] : null;
//     return await findMedicineResponse(medicineName, location);
//   } else if (command === "UPDATE" && parts.length >= 4) {
//     return "Update feature coming soon. Please use the web app for now.";
//   } else {
//     return "Invalid command. Use FIND [MEDICINE] [LOCATION] or UPDATE [MEDICINE] [YES/NO] [PHARMACY_ID]";
//   }
// }

// async function findMedicineResponse(
//   medicineName: string,
//   location: string | null
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

//     if (medicines.length === 0) {
//       return `No results found for ${medicineName}`;
//     }

//     const availableAt: string[] = [];

//     for (const medicine of medicines) {
//       for (let i = 0; i < (medicine.availability?.length || 0); i++) {
//         const avail = medicine.availability[i];
//         const pharmacy = medicine.pharmacyDetails.find(
//           (p: any) => p._id.toString() === avail.pharmacyId.toString()
//         );
//         if (
//           avail.instock &&
//           pharmacy &&
//           (!location || pharmacy.location.toUpperCase().includes(location))
//         ) {
//           availableAt.push(`${pharmacy.name} (${pharmacy.contactNumber})`);
//           if (availableAt.length >= 3) break;
//         }
//       }
//     }

//     if (availableAt.length === 0) {
//       return `${medicineName} is currently out of stock in ${
//         location || "all locations"
//       }`;
//     } else {
//       return `${medicineName} available at: ${availableAt.join(", ")}`;
//     }
//   } catch (error) {
//     console.error("Error processing medicine search:", error);
//     return "Sorry, we encountered an error processing your request. Please try again later.";
//   }
// }

// import { validateEnv } from "@/helpers/validateEnv";
// import twilio from "twilio";

// validateEnv();
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );
// const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// export async function sendSMS(to: string, message: string) {
//   try {
//     const formattedNumber = to.startsWith("+")
//       ? to
//       : `+233${to.replace(/^0/, "")}`;
//     const response = await twilioClient.messages.create({
//       body: message,
//       from: twilioPhoneNumber,
//       to: formattedNumber,
//     });

//     return response;
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     throw error;
//   }
// }

// /**
//  * Process an incoming SMS query and generate a response
//  * @param query The SMS query text
//  * @returns Formatted response text
//  */
// export async function processSMSQuery(query: string) {
//   // Parse the SMS command
//   // Format examples:
//   // FIND PARACETAMOL Kumasi
//   // UPDATE PARACETAMOL YES PHARMACY_ID

//   const parts = query.trim().toUpperCase().split(" ");
//   const command = parts[0];

//   if (command === "FIND" && parts.length >= 2) {
//     const medicineName = parts[1];
//     const location = parts.length >= 3 ? parts[2] : null;

//     return await findMedicineResponse(medicineName, location);
//   } else if (command === "UPDATE" && parts.length >= 4) {
//     return "Update feature coming soon. Please use the web app for now.";
//   } else {
//     return "Invalid command. Use FIND [MEDICINE] [LOCATION] or UPDATE [MEDICINE] [YES/NO] [PHARMACY_ID]";
//   }
// }

// //Generate a response for a medicine search query
// async function findMedicineResponse(
//   medicineName: string,
//   location: string | null
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
//     if (medicines.length === 0) {
//       return `No results found for ${medicineName}`;
//     }

//     // Filter by location if provided
//     const availableAt = [];
//     for (const medicine of medicines) {
//       for (let i = 0; i < medicine.availability?.length || 0; i++) {
//         const avail = medicine.availability[i];
//         const pharmacy = medicine.pharmacyDetails.find(
//           (p:any) => p._id.toString() === avail.pharmacyId.toString()
//         );
//         if (
//           avail.instock &&
//           pharmacy &&
//           (!location || pharmacy.location.toUpperCase().includes(location))
//         ) {
//           availableAt.push(`${pharmacy.name} (${pharmacy.contactNumber})`);

//           // Limit to 3 results for SMS
//           if (availableAt.length >= 3) break;
//         }
//       }
//     }
//     if (availableAt.length === 0) {
//       return `${medicineName} is currently out of stock in ${
//         location || "all locations"
//       }`;
//     } else {
//       return `${medicineName} available at: ${availableAt.join(", ")}`;
//     }
//   } catch (error) {
//     console.error("Error processing medicine search:", error);
//     return "Sorry, we encountered an error processing your request. Please try again later.";
//   }
// }
// 3fdjw1Fx1Y6WKUjTI9ATtiGRL
import axios from "axios";

// Configure mNotify credentials
const mNotifyConfig = {
  apiKey: "KCRtsmYMxPd3zo4aa6uWboKR5", // Replace with your actual key
  senderID: "MEDIFIND-GH", // Your approved sender ID
  smsEndpoint: "https://apps.mnotify.net/smsapi",
};

export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    const response = await axios.post(
      `${mNotifyConfig.smsEndpoint}?key=${mNotifyConfig.apiKey}` +
      `&to=${phoneNumber}` +
      `&msg=${encodeURIComponent(message)}` +
      `&sender_id=${mNotifyConfig.senderID}`
    );
    
    // Handle both object and string responses
    if (typeof response.data === 'object') {
      return response.data.status === 'success';
    } else if (typeof response.data === 'string') {
      return response.data.includes('sent') || 
             response.data.includes('queued');
    }
    return false;
    
  } catch (error) {
    console.error("mNotify SMS Error:", error);
    return false;
  }
}

export async function findMedicineResponse(
  medicineName: string,
  location: string | null,
  userPhoneNumber?: string // Add phone number parameter
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

    let responseMessage: string;

    if (medicines.length === 0) {
      responseMessage = `No results found for ${medicineName}`;
    } else {
      const availableAt: string[] = [];

      for (const medicine of medicines) {
        for (let i = 0; i < (medicine.availability?.length || 0); i++) {
          const avail = medicine.availability[i];
          const pharmacy = medicine.pharmacyDetails.find(
            (p: any) => p._id.toString() === avail.pharmacyId.toString()
          );
          if (
            avail.instock &&
            pharmacy &&
            (!location || pharmacy.location.toUpperCase().includes(location))
          ) {
            availableAt.push(`${pharmacy.name} (${pharmacy.contactNumber})`);
            if (availableAt.length >= 3) break;
          }
        }
      }

      responseMessage =
        availableAt.length === 0
          ? `${medicineName} is currently out of stock in ${
              location || "all locations"
            }`
          : `${medicineName} available at: ${availableAt.join(", ")}`;
    }

    // Send SMS if phone number provided
    if (userPhoneNumber) {
      await sendSMS(userPhoneNumber, responseMessage);
    }

    return responseMessage;
  } catch (error) {
    console.error("Error processing medicine search:", error);
    const errorMessage =
      "Sorry, we encountered an error processing your request. Please try again later.";

    if (userPhoneNumber) {
      await sendSMS(userPhoneNumber, errorMessage);
    }

    return errorMessage;
  }
}


/**
 * Send email function
 */
// export async function sendEmail(
//   to: string,
//   subject: string,
//   content: string,
//   isHtml: boolean = false
// ): Promise<boolean> {
//   try {
//     const mailOptions = {
//       from: emailConfig.sender,
//       to,
//       subject,
//       [isHtml ? 'html' : 'text']: content,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info.messageId);
//     return true;
//   } catch (error) {
//     console.error('Email send error:', error);
//     return false;
//   }
// }

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
      data.phoneNumber ? (async () => {
        try {
          results.smsSuccess = await sendSMS(data.phoneNumber!, verificationMessage);
        } catch (smsError) {
          console.error("SMS delivery failed:", smsError);
        }
      })() : Promise.resolve(),

      // Email delivery if email exists
      data.email ? (async () => {
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
      })() : Promise.resolve()
    ]);
  } catch (error) {
    console.error("Error in verification delivery:", error);
  }

  return results;
}