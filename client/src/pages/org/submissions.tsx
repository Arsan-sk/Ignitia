import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrgSubmissionsProps {
  orgId?: string;
}

export default function OrgSubmissions({ orgId }: OrgSubmissionsProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">
          View and manage submissions for your organization's events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Submissions</CardTitle>
          <CardDescription>
            All submissions from participants in your organization's events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No submissions available yet. Create some events to start receiving submissions!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
