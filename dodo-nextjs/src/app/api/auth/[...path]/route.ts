import { getAuth } from "@/lib/auth/server";

let _handlers: ReturnType<ReturnType<typeof getAuth>["handler"]> | null = null;

function handlers() {
  if (!_handlers) {
    _handlers = getAuth().handler();
  }
  return _handlers;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return handlers().GET(request, context);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return handlers().POST(request, context);
}