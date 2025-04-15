import { error } from "console";

export function validateEnv() {
  const requiredEnvVariables = [
    "MONGODB_URI",
    "MONGODB_DB",
    "JWT_SECRET",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
  ];

  requiredEnvVariables.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`Environment viriable ${varName} is missing!`);
    }
  });
}
