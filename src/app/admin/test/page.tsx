"use client";

import { useState, useEffect, type ReactNode } from "react";
import type { MaxCare, OrganizationInfo, FacilityInfo, UserInfo } from "@max-ai/app-bridge";
import { triggerResize } from "@max-ai/app-bridge";
import { useAdminBridge, useAuthHeaders } from "@/lib/bridge";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Separator,
  Skeleton,
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  Checkbox,
  Progress,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Alert,
  AlertTitle,
  AlertDescription,
  cn,
} from "@max-ai/components";
import { EmbeddedDialogContent } from "@/components/EmbeddedDialogContent";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold border-b pb-2">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-mono text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function AppBridgeSection() {
  const ctx = useAdminBridge();
  const headers = useAuthHeaders();
  const [bridgeResult, setBridgeResult] = useState<string>("");
  const [maxcare, setMaxcare] = useState<MaxCare | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    setIsEmbedded(window.self !== window.top);
    const mc = (window as unknown as { maxcare?: MaxCare }).maxcare;
    if (mc) setMaxcare(mc);
  }, []);

  function display(label: string, data: unknown) {
    setBridgeResult(`[${label}]\n${JSON.stringify(data, null, 2)}`);
  }

  return (
    <Section title="App Bridge">
      <Row label="Mode">
        <Badge variant={isEmbedded ? "default" : "secondary"}>
          {isEmbedded ? "Embedded (iframe)" : "Standalone (dev)"}
        </Badge>
        <Badge variant={ctx.ready ? "default" : "destructive"}>
          {ctx.ready ? "Ready" : "Not Ready"}
        </Badge>
        <Badge variant={maxcare ? "default" : "outline"}>
          {maxcare ? "window.maxcare exists" : "No window.maxcare"}
        </Badge>
      </Row>

      {isEmbedded && (
        <Row label="Resize iframe">
          <Button
            size="sm"
            variant="outline"
            onClick={() => triggerResize()}
          >
            Resize to current
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const h =
                Math.max(
                  document.body.scrollHeight,
                  document.documentElement.scrollHeight,
                ) * 1.5;
              if (window.parent !== window) {
                window.parent.postMessage(
                  {
                    protocol: "maxcare-app-bridge",
                    version: 1,
                    type: "resize:set-height",
                    id: `resize-${Date.now()}`,
                    source: "app",
                    payload: { height: Math.round(h) },
                  },
                  "*",
                );
              }
            }}
          >
            Resize to 150%
          </Button>
        </Row>
      )}

      <Row label="Context data (from useAdminBridge)">
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => display("organization", ctx.organization)}>
            Organization
          </Button>
          <Button size="sm" onClick={() => display("facilities", ctx.facilities)}>
            Facilities
          </Button>
          <Button size="sm" onClick={() => display("user", ctx.user)}>
            User
          </Button>
          <Button size="sm" onClick={() => display("config", ctx.config)}>
            Config
          </Button>
          <Button size="sm" variant="outline" onClick={() => display("headers", headers)}>
            Auth Headers
          </Button>
        </div>
      </Row>

      <Row label="Raw bridge (window.maxcare)">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              disabled={!maxcare}
              onClick={async () => {
                if (!maxcare) return;
                try {
                  const org: OrganizationInfo = await maxcare.organization();
                  display("maxcare.organization()", org);
                } catch (e) {
                  display("error", String(e));
                }
              }}
            >
              maxcare.organization()
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!maxcare}
              onClick={async () => {
                if (!maxcare) return;
                try {
                  const f: FacilityInfo[] = await maxcare.facilities();
                  display("maxcare.facilities()", f);
                } catch (e) {
                  display("error", String(e));
                }
              }}
            >
              maxcare.facilities()
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!maxcare}
              onClick={async () => {
                if (!maxcare) return;
                try {
                  const u: UserInfo = await maxcare.user();
                  display("maxcare.user()", u);
                } catch (e) {
                  display("error", String(e));
                }
              }}
            >
              maxcare.user()
            </Button>
          </div>
          {!maxcare && (
            <p className="text-xs text-muted-foreground">
              Disabled — window.maxcare only exists when embedded in the MaxAI dashboard
            </p>
          )}
        </div>
      </Row>

      <Row label="Toasts (window.maxcare)">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={!maxcare}
              onClick={() => {
                if (!maxcare) return;
                maxcare.toast.show("This is a success toast!", { variant: "success" });
                display("toast", "Success toast sent");
              }}
            >
              Success Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!maxcare}
              onClick={() => {
                if (!maxcare) return;
                maxcare.toast.show("This is an error toast!", { variant: "error" });
                display("toast", "Error toast sent");
              }}
            >
              Error Toast
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!maxcare}
              onClick={() => {
                if (!maxcare) return;
                maxcare.toast.show("This is a default toast!");
                display("toast", "Default toast sent");
              }}
            >
              Default Toast
            </Button>
          </div>
          {!maxcare && (
            <p className="text-xs text-muted-foreground">
              Disabled — toasts require the MaxAI dashboard host
            </p>
          )}
        </div>
      </Row>

      {bridgeResult && (
        <pre className="bg-muted p-3 rounded-lg text-xs font-mono overflow-auto max-h-60">
          {bridgeResult}
        </pre>
      )}
    </Section>
  );
}

function ComponentsSection() {
  const [switchOn, setSwitchOn] = useState(false);
  const [checkboxOn, setCheckboxOn] = useState(false);
  const [progress, setProgress] = useState(45);
  const [selectVal, setSelectVal] = useState("option1");
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Section title="Components (@max-ai/components)">
      <Row label="Button — variants">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </Row>

      <Row label="Button — sizes">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Button>
        <Button disabled>Disabled</Button>
      </Row>

      <Separator className="my-2" />

      <Row label="Badge — variants">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </Row>

      <Separator className="my-2" />

      <Row label="Card">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description goes here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Card content area</p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save</Button>
          </CardFooter>
        </Card>
      </Row>

      <Separator className="my-2" />

      <Row label="Input + Label">
        <div className="flex flex-col gap-1.5 w-64">
          <Label htmlFor="test-input">Email address</Label>
          <Input id="test-input" placeholder="you@example.com" />
        </div>
      </Row>

      <Row label="Textarea">
        <Textarea placeholder="Write something..." className="w-64" />
      </Row>

      <Separator className="my-2" />

      <Row label="Select">
        <div className="flex items-center gap-2">
          <Select value={selectVal} onValueChange={setSelectVal}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">Selected: {selectVal}</span>
        </div>
      </Row>

      <Separator className="my-2" />

      <Row label="Switch">
        <div className="flex items-center gap-2">
          <Switch checked={switchOn} onCheckedChange={setSwitchOn} />
          <Label>{switchOn ? "On" : "Off"}</Label>
        </div>
      </Row>

      <Row label="Checkbox">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={checkboxOn}
            onCheckedChange={(v) => setCheckboxOn(v === true)}
          />
          <Label>Accept terms</Label>
        </div>
      </Row>

      <Separator className="my-2" />

      <Row label="Progress">
        <div className="flex items-center gap-3 w-full max-w-sm">
          <Progress value={progress} className="flex-1" />
          <span className="text-xs text-muted-foreground w-10">{progress}%</span>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => setProgress(Math.max(0, progress - 15))}>-</Button>
          <Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 15))}>+</Button>
        </div>
      </Row>

      <Separator className="my-2" />

      <Row label="Tabs">
        <Tabs defaultValue="tab1" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm">Content for tab 1</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tab2">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm">Content for tab 2</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tab3">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm">Content for tab 3</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Row>

      <Separator className="my-2" />

      <Row label="Table">
        <Card className="w-full max-w-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Item Alpha</TableCell>
                <TableCell><Badge>Active</Badge></TableCell>
                <TableCell>100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Item Beta</TableCell>
                <TableCell><Badge variant="outline">Pending</Badge></TableCell>
                <TableCell>--</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Item Gamma</TableCell>
                <TableCell><Badge variant="secondary">Draft</Badge></TableCell>
                <TableCell>42</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Row>

      <Separator className="my-2" />

      <Row label="Separator (horizontal)">
        <div className="w-64">
          <Separator />
        </div>
      </Row>

      <Row label="Separator (vertical)">
        <div className="flex items-center gap-2 h-6">
          <span className="text-sm">Left</span>
          <Separator orientation="vertical" className="h-full" />
          <span className="text-sm">Right</span>
        </div>
      </Row>

      <Separator className="my-2" />

      <Row label="Skeleton">
        <div className="flex flex-col gap-2 w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </Row>

      <Separator className="my-2" />

      <Row label="Alert">
        <Alert className="w-full max-w-md">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>This is an alert component from @max-ai/components.</AlertDescription>
        </Alert>
      </Row>

      <Separator className="my-2" />

      <Row label="Dialog">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Open Dialog</Button>
          </DialogTrigger>
          <EmbeddedDialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This is a dialog from @max-ai/components. Click outside or press Escape to close.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setDialogOpen(false)}>Confirm</Button>
            </div>
          </EmbeddedDialogContent>
        </Dialog>
      </Row>

      <Separator className="my-2" />

      <Row label="Tooltip">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover me</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tooltip content from @max-ai/components</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Row>

      <Separator className="my-2" />

      <Row label="cn() utility">
        <div className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium",
          "bg-primary text-primary-foreground",
        )}>
          Styled with cn()
        </div>
        <div className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium",
          "bg-destructive text-destructive-foreground",
        )}>
          cn() destructive
        </div>
      </Row>
    </Section>
  );
}

export default function TestPage() {
  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-2xl font-bold">Test Page</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visual QA for @max-ai/app-bridge and @max-ai/components
        </p>
      </div>

      <AppBridgeSection />
      <ComponentsSection />
    </div>
  );
}
