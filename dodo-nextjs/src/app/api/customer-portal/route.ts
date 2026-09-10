import { NextRequest } from "next/server";
import { CustomerPortal } from "@dodopayments/nextjs";

export const dynamic = "force-dynamic";

let _handler: Awaited<ReturnType<typeof CustomerPortal>> | null = null;

export async function GET(request: NextRequest) {
  if (!_handler) {
    _handler = CustomerPortal({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
      environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
    });
  }
  return _handler(request);
}