"use client";

import { useAdminBridge } from "@/lib/bridge";
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from "@max-ai/components";

export default function DashboardPage() {
  const { organization, selectedFacilityId, facilities } = useAdminBridge();
  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {organization?.name ?? "Unknown org"}
            {selectedFacility ? ` — ${selectedFacility.name}` : ""}
          </p>
        </div>
        <Badge variant="outline">Active</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            {"This is your app's main dashboard page. Edit "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{"src/app/admin/page.tsx"}</code>
            {" to build your UI."}
          </p>
          <p>
            {"Add new pages under "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{"src/app/admin/"}</code>
            {" and register them in the nav inside "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{"src/app/admin/layout.tsx"}</code>
            {"."}
          </p>
          <div className="pt-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/test">View Test Page</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
