import { type NextRequest, NextResponse } from "next/server"

import { connectToMongoDB } from "@/lib/mongodb"
import { processSMSQuery } from "@/lib/sms"

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB()

    // Twilio sends data as form-urlencoded
    const formData = await request.formData()

    // Extract SMS data from Twilio webhook format
    const from = formData.get("From") as string
    const body = formData.get("Body") as string
    const to = formData.get("To") as string
    const messageSid = formData.get("MessageSid") as string

    if (!from || !body) {
      return NextResponse.json({ error: "Missing SMS data" }, { status: 400 })
    }

    // Log the incoming SMS
    await db.collection("smsLogs").insertOne({
      from,
      to,
      text: body,
      messageId: messageSid,
      provider: "twilio",
      receivedAt: new Date(),
    })

    // Process the SMS and generate a response
    const responseText = await processSMSQuery(body)

    // Twilio expects a TwiML response
    const twimlResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>${responseText}</Message>
      </Response>
    `

    return new NextResponse(twimlResponse, {
      headers: {
        "Content-Type": "text/xml",
      },
    })
  } catch (error) {
    console.error("Error processing SMS webhook:", error)

    // Return a TwiML error response
    const twimlErrorResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Sorry, we encountered an error processing your request. Please try again later.</Message>
      </Response>
    `

    return new NextResponse(twimlErrorResponse, {
      headers: {
        "Content-Type": "text/xml",
      },
    })
  }
}
