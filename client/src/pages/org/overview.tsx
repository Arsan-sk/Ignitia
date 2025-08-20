import { useEffect } from "react";
import { useParams, Redirect } from "wouter";
import OrgTopBar from "@/components/layout/org-topbar";
import OrgTabs from "@/components/layout/org-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function OrgOverviewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const params = useParams();
  const orgId = params?.orgId as string;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/orgs", orgId, "overview"],
    enabled: !!orgId,
  });

  useEffect(() => {
    // refetch on mount when orgId changes
    if (orgId) refetch();
  }, [orgId]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Redirect to="/login" />;
  if (!orgId) return <Redirect to="/dashboard" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <OrgTopBar />
      <OrgTabs orgId={orgId} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Events" value={data?.stats?.activeEvents ?? 0} />
          <StatCard title="Total Participants" value={data?.stats?.totalParticipants ?? 0} />
          <StatCard title="Ongoing Rounds" value={data?.stats?.ongoingRounds ?? 0} />
          <StatCard title="Submissions (7d)" value={data?.stats?.submissions7d ?? 0} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    {data?.recent?.announcements?.map((a: any) => (
                      <div key={a.id} className="text-sm text-gray-700 dark:text-gray-300">Announcement: {a.title}</div>
                    ))}
                    {data?.recent?.submissions?.map((s: any) => (
                      <div key={s.id} className="text-sm text-gray-700 dark:text-gray-300">Submission from team {s.teamId}</div>
                    ))}
                    {data?.recent?.qna?.map((q: any) => (
                      <div key={q.id} className="text-sm text-gray-700 dark:text-gray-300">Q&A: {q.title}</div>
                    ))}
                    {!data?.recent && <div className="text-sm text-gray-500">No recent activity.</div>}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data?.upcomingEvents?.length ? (
                  data.upcomingEvents.map((e: any) => (
                    <div key={e.id} className="text-sm text-gray-700 dark:text-gray-300">{e.title} — {new Date(e.startAt).toLocaleDateString()}</div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No upcoming events.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
