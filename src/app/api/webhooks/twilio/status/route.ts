import { NextRequest, NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabase/admin";

// Map Twilio status to our status
function mapTwilioStatus(twilioStatus: string): string {
  switch (twilioStatus.toLowerCase()) {
    case "queued":
    case "sending":
      return "pending";
    case "sent":
      return "sent";
    case "delivered":
      return "delivered";
    case "read":
      return "read";
    case "failed":
      return "failed";
    case "undelivered":
      return "undelivered";
    default:
      return "sent";
  }
}

// POST: Receive Twilio status callback
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();

    const messageSid = formData.get("MessageSid") as string;
    const messageStatus = formData.get("MessageStatus") as string;
    const errorCode = formData.get("ErrorCode") as string | null;
    const errorMessage = formData.get("ErrorMessage") as string | null;

    if (!messageSid || !messageStatus) {
      console.warn("Twilio webhook: Missing required fields");
      return NextResponse.json({ received: false }, { status: 400 });
    }

    console.log(`Twilio status update: ${messageSid} -> ${messageStatus}`);

    // Map to our status
    const status = mapTwilioStatus(messageStatus);

    // Build error message if present
    let errorText = null;
    if (errorCode || errorMessage) {
      errorText = [errorCode, errorMessage].filter(Boolean).join(": ");
    }

    // Update notification in database
    const { data, error } = await supabaseAdmin.rpc("update_notification_status", {
      p_twilio_message_sid: messageSid,
      p_status: status,
      p_error_message: errorText,
    });

    if (error) {
      console.error("Error updating notification status:", error);
      // Still return 200 to Twilio to prevent retries
      return NextResponse.json({ received: true, updated: false });
    }

    return NextResponse.json({
      received: true,
      updated: data,
      status,
    });
  } catch (error) {
    console.error("Twilio webhook error:", error);
    // Return 200 to prevent Twilio from retrying
    return NextResponse.json({ received: true, error: true });
  }
}

// Twilio may also send GET requests for verification
export async function GET() {
  return NextResponse.json({ status: "ok", service: "twilio-webhook" });
}
