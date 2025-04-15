import { validateEnv } from "@/helpers/validateEnv";
import twilio from "twilio";

validateEnv();
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMS(to: string, message: string) {
  try {
    const formattedNumber = to.startsWith("+")
      ? to
      : `+233${to.replace(/^0/, "")}`;
    const response = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedNumber,
    });

    return response;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}

//Process an incoming SMS query and generate a response

export async function processSMSQuery(query: string) {
  // Parse the SMS command
  // Format examples:
  // FIND PARACETAMOL Kumasi
  // UPDATE PARACETAMOL YES PHARMACY_ID

  const parts = query.trim().toUpperCase().split(" ");
  const command = parts[0];

  if (command === "FIND" && parts.length >= 2) {
    const medicineName = parts[1];
    const location = parts.length >= 3 ? parts[2] : null;

    return await findMedicineResponse(medicineName, location);
  } else if (command === "UPDATE" && parts.length >= 4) {
    return "Update feature coming soon. Please use the web app for now.";
  } else {
    return "Invalid command. Use FIND [MEDICINE] [LOCATION] or UPDATE [MEDICINE] [YES/NO] [PHARMACY_ID]";
  }
}

//Generate a response for a medicine search query
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
          (p:any) => p._id.toString() === avail.pharmacyId.toString()
        );
        if (
          avail.instock &&
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
      return `${medicineName} is currently out of stock in ${
        location || "all locations"
      }`;
    } else {
      return `${medicineName} available at: ${availableAt.join(", ")}`;
    }
  } catch (error) {
    console.error("Error processing medicine search:", error);
    return "Sorry, we encountered an error processing your request. Please try again later.";
  }
}
