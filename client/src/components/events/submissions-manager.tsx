import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Trophy, Filter, Download, Eye, Check, X, Clock, Play, Pause, 
  ChevronRight, ExternalLink, FileText, Users, Star, MessageCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SubmissionsManagerProps {
  eventId: string;
  event: any;
}

export default function SubmissionsManager({ eventId, event }: SubmissionsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRound, setSelectedRound] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["/api/events", eventId, "submissions", { round: selectedRound, status: statusFilter }],
    enabled: !!eventId
  });

  const updateRoundStatusMutation = useMutation({
    mutationFn: async ({ roundId, status, formEnabled }: { roundId: string; status: string; formEnabled?: boolean }) => {
      const response = await apiRequest("PATCH", `/api/events/${eventId}/rounds/${roundId}`, { 
        status, 
        formEnabled 
      });
      return response.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({
        title: `Round ${status === 'open' ? 'Opened' : 'Closed'}`,
        description: `Round has been ${status === 'open' ? 'opened for submissions' : 'closed'}.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Round",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const reviewSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, status, feedback }: { submissionId: string; status: string; feedback?: string }) => {
      const response = await apiRequest("PATCH", `/api/submissions/${submissionId}`, {
        status,
        feedback
      });
      return response.json();
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "submissions"] });
      setReviewDialogOpen(false);
      setFeedback("");
      toast({
        title: `Submission ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `Submission has been ${status === 'approved' ? 'approved' : 'rejected'}.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Review Submission",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const autoAdvanceMutation = useMutation({
    mutationFn: async (roundId: string) => {
      const response = await apiRequest("POST", `/api/events/${eventId}/rounds/${roundId}/advance`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({
        title: "Teams Advanced",
        description: "Qualified teams have been moved to the next round."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Advance Teams",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const rounds = event?.metadata?.rounds || [];
  const isHackathon = event?.type === 'hackathon';

  const getRoundStatusBadge = (status: string) => {
    const styles = {
      scheduled: "badge-secondary",
      open: "badge-success",
      closed: "badge-danger"
    };
    return styles[status as keyof typeof styles] || "badge-secondary";
  };

  const getSubmissionStatusBadge = (status: string) => {
    const styles = {
      submitted: "badge-info",
      approved: "badge-success",
      rejected: "badge-danger",
      "under-review": "badge-warning"
    };
    return styles[status as keyof typeof styles] || "badge-info";
  };

  return (
    <div className="space-y-6">
      {/* Round Controls for Hackathons */}
      {isHackathon && rounds.length > 0 && (
        <Card className="card-professional">
          <CardHeader className="card-header-professional">
            <CardTitle>Round Management</CardTitle>
            <CardDescription>
              Control submission windows and round progression
            </CardDescription>
          </CardHeader>
          <CardContent className="card-content-professional">
            <div className="space-y-4">
              {rounds.map((round: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="heading-sm">Round {index + 1}: {round.name}</h4>
                      <p className="text-sm text-muted">{round.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-subtle">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(round.startAt).toLocaleDateString()} - {new Date(round.endAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoundStatusBadge(round.status || 'scheduled')}>
                      {round.status || 'scheduled'}
                    </Badge>
                    {round.status === 'scheduled' && (
                      <Button
                        size="sm"
                        onClick={() => updateRoundStatusMutation.mutate({ 
                          roundId: round.id || index.toString(), 
                          status: 'open', 
                          formEnabled: true 
                        })}
                        disabled={updateRoundStatusMutation.isPending}
                        className="btn-primary"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Open Round
                      </Button>
                    )}
                    {round.status === 'open' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateRoundStatusMutation.mutate({ 
                            roundId: round.id || index.toString(), 
                            status: 'closed' 
                          })}
                          disabled={updateRoundStatusMutation.isPending}
                          variant="outline"
                          className="btn-outline"
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Close Round
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => autoAdvanceMutation.mutate(round.id || index.toString())}
                          disabled={autoAdvanceMutation.isPending}
                          className="btn-secondary"
                        >
                          <ChevronRight className="w-4 h-4 mr-1" />
                          Auto-Advance
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions List */}
      <Card className="card-professional">
        <CardHeader className="card-header-professional">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Event Submissions</CardTitle>
              <CardDescription>
                Review and manage participant submissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="btn-outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="card-content-professional">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {isHackathon && (
              <Select value={selectedRound} onValueChange={setSelectedRound}>
                <SelectTrigger className="w-full sm:w-[180px] form-input">
                  <SelectValue placeholder="Filter by round" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rounds</SelectItem>
                  {rounds.map((round: any, index: number) => (
                    <SelectItem key={index} value={round.id || index.toString()}>
                      Round {index + 1}: {round.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] form-input">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submissions List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : submissions && submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission: any) => (
                <div
                  key={submission.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="heading-sm">
                          {submission.teamName || `Team ${submission.teamId}`}
                        </h4>
                        <Badge className={getSubmissionStatusBadge(submission.status)}>
                          {submission.status}
                        </Badge>
                        {isHackathon && (
                          <Badge variant="outline">
                            Round {submission.roundNumber || 1}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {submission.memberCount || 0} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          {submission.score && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {submission.score}/{submission.maxScore}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {submission.githubUrl && (
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            GitHub Repository
                          </a>
                        )}
                        {submission.videoUrl && (
                          <a
                            href={submission.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline ml-4"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Demo Video
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setReviewDialogOpen(true);
                        }}
                        className="btn-outline"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      {submission.status === 'submitted' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => reviewSubmissionMutation.mutate({
                              submissionId: submission.id,
                              status: 'approved'
                            })}
                            disabled={reviewSubmissionMutation.isPending}
                            className="btn-success"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reviewSubmissionMutation.mutate({
                              submissionId: submission.id,
                              status: 'rejected'
                            })}
                            disabled={reviewSubmissionMutation.isPending}
                            className="btn-danger"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-subtle" />
              <h3 className="heading-sm mb-2">No Submissions Yet</h3>
              <p>Submissions will appear here once participants start submitting.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              {selectedSubmission?.teamName || `Team ${selectedSubmission?.teamId}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Submission Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge className={getSubmissionStatusBadge(selectedSubmission?.status || 'submitted')}>
                    {selectedSubmission?.status || 'submitted'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Submitted:</span>
                  <span>{selectedSubmission ? new Date(selectedSubmission.submittedAt).toLocaleString() : ''}</span>
                </div>
                {selectedSubmission?.githubUrl && (
                  <div>
                    <span>GitHub: </span>
                    <a
                      href={selectedSubmission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {selectedSubmission.githubUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Feedback (Optional)
              </label>
              <Textarea
                placeholder="Provide feedback for the submission..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              className="btn-outline"
            >
              Cancel
            </Button>
            <Button
              onClick={() => reviewSubmissionMutation.mutate({
                submissionId: selectedSubmission?.id,
                status: 'rejected',
                feedback
              })}
              disabled={reviewSubmissionMutation.isPending}
              variant="outline"
              className="btn-danger"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => reviewSubmissionMutation.mutate({
                submissionId: selectedSubmission?.id,
                status: 'approved',
                feedback
              })}
              disabled={reviewSubmissionMutation.isPending}
              className="btn-primary"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
