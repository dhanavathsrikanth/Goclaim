import { NextResponse } from "next/server";

// Placeholder proxy (Next 16 convention): the app needs no request rewriting,
// but the OpenNext adapter requires a concrete middleware bundle in the
// standalone output (Next 16 emits manifests without one, breaking the build).
// The matcher never matches a real path, so this never executes at runtime.
export default function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/__never__"],
};
