import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OrgJudgingProps {
  orgId?: string;
}

export default function OrgJudging({ orgId }: OrgJudgingProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Judging</h1>
        <p className="text-muted-foreground">
          Manage judging criteria, assign judges, and evaluate submissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Judging Dashboard</CardTitle>
          <CardDescription>
            Evaluation tools and judge management for your events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              No active judging sessions. Set up evaluation criteria for your events!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
