import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrgLeaderboardProps {
  orgId?: string;
}

export default function OrgLeaderboard({ orgId }: OrgLeaderboardProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          Track participant rankings and event standings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Rankings</CardTitle>
          <CardDescription>
            Current standings and scores for all participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No rankings available yet. Scores will appear here once events are completed!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
