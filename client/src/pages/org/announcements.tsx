import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrgAnnouncementsProps {
  orgId?: string;
}

export default function OrgAnnouncements({ orgId }: OrgAnnouncementsProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Announcements</h1>
        <p className="text-muted-foreground">
          Create and manage announcements for your organization's events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Announcements</CardTitle>
          <CardDescription>
            Important updates and notifications for participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No announcements yet. Create announcements to keep participants informed!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
