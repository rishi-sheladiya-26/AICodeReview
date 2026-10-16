import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getRazorpay } from "@/lib/razorpay";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const razorpay = getRazorpay();

  if (!razorpay) {
    return NextResponse.json(
      {
        error:
          "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the environment.",
      },
      { status: 500 }
    );
  }

  const amount = Number(process.env.RAZORPAY_PRO_AMOUNT || "14900");
  const currency = process.env.RAZORPAY_CURRENCY || "INR";

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: `repopilot_pro_${user.id}`,
    notes: {
      userId: user.id,
      email: user.email,
      plan: "PRO",
    },
  });

  return NextResponse.json({
    key: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
  });
}
