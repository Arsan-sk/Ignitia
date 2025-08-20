import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrgAnalyticsProps {
  orgId?: string;
}

export default function OrgAnalytics({ orgId }: OrgAnalyticsProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          View detailed analytics and insights for your organization's events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Analytics</CardTitle>
          <CardDescription>
            Performance metrics and participation statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No analytics data available yet. Analytics will appear once you have active events with participants!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
