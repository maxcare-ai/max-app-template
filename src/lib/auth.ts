import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export interface AuthContext {
  organizationId: string;
  facilityId: string | null;
}

const UNAUTHORIZED = (msg: string) =>
  NextResponse.json({ error: msg }, { status: 401 });

/**
 * Extracts and validates auth context from admin API requests.
 *
 * The org header is required. The facility header is optional — when present
 * it narrows queries to a single facility; when absent, queries return data
 * for the entire org.
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthContext | NextResponse> {
  const organizationId = request.headers.get("x-organization-id");
  const facilityId =
    request.headers.get("x-facility-id") ||
    new URL(request.url).searchParams.get("facilityId") ||
    null;

  if (!organizationId) {
    return UNAUTHORIZED("Missing x-organization-id header");
  }

  logger.debug({ organizationId, facilityId }, "Auth context resolved");

  return { organizationId, facilityId };
}
