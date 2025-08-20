import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrgParticipantsProps {
  orgId?: string;
}

export default function OrgParticipants({ orgId }: OrgParticipantsProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Participants</h1>
        <p className="text-muted-foreground">
          Manage and view all participants across your organization's events
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Participants</CardTitle>
          <CardDescription>
            All registered participants and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No participants registered yet. Participants will appear here once they register for your events!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
