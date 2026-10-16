import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

type RazorpayNotes = {
  userId?: string;
};

type RazorpayWebhookPayload = {
  payload?: {
    payment?: {
      entity?: {
        notes?: RazorpayNotes;
      };
    };
  };
  payment?: {
    notes?: RazorpayNotes;
  };
  userId?: string;
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (signature && process.env.RAZORPAY_WEBHOOK_SECRET) {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let payload: RazorpayWebhookPayload;

  try {
    payload = JSON.parse(body || "{}") as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const paymentEntity =
    payload?.payload?.payment?.entity ?? payload?.payment ?? null;

  const userId =
    (paymentEntity && "notes" in paymentEntity
      ? paymentEntity.notes?.userId
      : undefined) ?? payload?.userId;

  if (!userId) {
    return NextResponse.json({ received: true });
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: "PRO",
      subscriptionStatus: "ACTIVE",
    },
  });

  return NextResponse.json({ received: true });
}
