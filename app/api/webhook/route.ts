import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        console.error(`[WEBHOOK_ERROR] Invalid signature or event:`, error);
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // Log the event type and data for debugging
    console.log(`[WEBHOOK] Received event:`, event.type, JSON.stringify(event.data.object));

    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session?.metadata?.userId;
    const courseId = session?.metadata?.courseId;

    if (event.type === "checkout.session.completed") {
        if (!userId || !courseId) {
            console.error(`[WEBHOOK_ERROR] Missing metadata: userId=${userId}, courseId=${courseId}`);
            return new NextResponse(`Webhook Error: Missing metadata`, { status: 400 });
        }

        try {
            await db.purchase.create({
                data: {
                    courseId: courseId,
                    userId: userId,
                }
            });
            console.log(`[WEBHOOK] Purchase created for userId=${userId}, courseId=${courseId}`);
            return new NextResponse(null, { status: 200 });
        } catch (error) {
            console.error("[WEBHOOK_ERROR] Failed to create purchase:", error);
            return new NextResponse("Internal Error", { status: 500 });
        }
    }

    return new NextResponse(null, { status: 200 });
}

