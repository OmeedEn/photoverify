import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Use the service role client to bypass RLS for subscription management
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase service role credentials not configured.");
  }

  return createClient(url, serviceKey);
}

/**
 * Verify Stripe webhook signature.
 * Uses the raw body and the Stripe-Signature header to compute an HMAC
 * and compare it to the expected signature.
 */
function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): boolean {
  const parts = sigHeader.split(",").reduce(
    (acc, part) => {
      const [key, value] = part.split("=");
      if (key === "t") acc.timestamp = value;
      if (key === "v1") acc.signatures.push(value);
      return acc;
    },
    { timestamp: "", signatures: [] as string[] }
  );

  if (!parts.timestamp || parts.signatures.length === 0) {
    return false;
  }

  const signedPayload = `${parts.timestamp}.${payload}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");

  return parts.signatures.some(
    (sig) =>
      crypto.timingSafeEqual(
        Buffer.from(expectedSig),
        Buffer.from(sig)
      )
  );
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured." },
        { status: 500 }
      );
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header." },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    const isValid = verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature." },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const supabase = getServiceClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (!userId) {
          console.error("No user_id in checkout session metadata");
          break;
        }

        // Fetch subscription details from Stripe
        const stripeKey = process.env.STRIPE_SECRET_KEY!;
        const subResponse = await fetch(
          `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
          {
            headers: { Authorization: `Bearer ${stripeKey}` },
          }
        );
        const subscription = await subResponse.json();

        // Upsert subscription record
        await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: "active",
            plan: "pro",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          },
          { onConflict: "stripe_subscription_id" }
        );

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        const status = subscription.status;

        await supabase
          .from("subscriptions")
          .update({
            status: status === "active" ? "active" : "inactive",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        break;
      }

      default:
        // Unhandled event type - acknowledge receipt
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}
