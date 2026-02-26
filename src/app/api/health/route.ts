import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db/data-source";

export async function GET() {
  const dbCheck = getDataSource()
    .then(() => "connected" as const)
    .catch(() => "disconnected" as const);

  const db = await Promise.race([
    dbCheck,
    new Promise<"timeout">((r) => setTimeout(() => r("timeout"), 3000)),
  ]);

  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    db,
  });
}
