import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import Navbar from "@/components/layout/navbar";
import ParticipantTabs from "@/components/layout/participant-tabs";
import { 
  Trophy, Medal, Star, TrendingUp, Users, 
  Calendar, Target, Award, Crown, Zap, RefreshCw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function ParticipantLeaderboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/leaderboard', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      return response.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (user.role !== 'participant') {
    return <Redirect to="/org" />;
  }
  
  // Process leaderboard data or use fallback if API fails
  const processedLeaderboardData = leaderboardData || [
    {
      rank: 1,
      name: "Alex Chen",
      username: "alexchen",
      avatar: "AC",
      points: 4850,
      eventsWon: 12,
      eventsParticipated: 25,
      winRate: 48,
      streak: 5,
      isCurrentUser: false
    },
    {
      rank: 2,
      name: "Sarah Wilson",
      username: "sarahwilson",
      avatar: "SW",
      points: 4720,
      eventsWon: 10,
      eventsParticipated: 22,
      winRate: 45,
      streak: 3,
      isCurrentUser: false
    },
    {
      rank: 3,
      name: "Mike Johnson",
      username: "mikej",
      avatar: "MJ",
      points: 4520,
      eventsWon: 9,
      eventsParticipated: 20,
      winRate: 45,
      streak: 2,
      isCurrentUser: false
    },
    {
      rank: 4,
      name: "Lisa Park",
      username: "lisapark",
      avatar: "LP",
      points: 4200,
      eventsWon: 8,
      eventsParticipated: 19,
      winRate: 42,
      streak: 1,
      isCurrentUser: false
    },
    {
      rank: 5,
      name: "Tom Anderson",
      username: "tomanderson",
      avatar: "TA",
      points: 3950,
      eventsWon: 7,
      eventsParticipated: 18,
      winRate: 39,
      streak: 4,
      isCurrentUser: false
    },
    {
      rank: 6,
      name: "Emma Davis",
      username: "emmadavis",
      avatar: "ED",
      points: 3720,
      eventsWon: 6,
      eventsParticipated: 16,
      winRate: 38,
      streak: 0,
      isCurrentUser: false
    },
    {
      rank: 7,
      name: "James Wilson",
      username: "jameswilson",
      avatar: "JW",
      points: 3500,
      eventsWon: 5,
      eventsParticipated: 15,
      winRate: 33,
      streak: 1,
      isCurrentUser: false
    },
    {
      rank: 8,
      name: "Maria Garcia",
      username: "mariagarcia",
      avatar: "MG",
      points: 3300,
      eventsWon: 4,
      eventsParticipated: 14,
      winRate: 29,
      streak: 2,
      isCurrentUser: false
    },
    {
      rank: 45,
      name: user?.firstName + " " + user?.lastName,
      username: user?.username,
      avatar: user?.firstName?.[0] + user?.lastName?.[0],
      points: 2340,
      eventsWon: 4,
      eventsParticipated: 15,
      winRate: 27,
      streak: 1,
      isCurrentUser: true
    }
  ];

  const topPerformers = processedLeaderboardData.slice(0, 3);
  const otherRanks = processedLeaderboardData.slice(3, 8);
  const currentUserRank = processedLeaderboardData.find(user => user.isCurrentUser);

  // Timeframe options for filtering
  const timeframeOptions = [
    { id: 'all', label: 'All Time', value: 'all' },
    { id: 'month', label: 'This Month', value: 'month' },
    { id: 'week', label: 'This Week', value: 'week' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <ParticipantTabs />
      
      <main>
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Leaderboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              See how you rank against other participants across the platform
            </p>
          </div>

          {/* Timeframe Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Timeframe:</span>
              {timeframeOptions.map((option) => (
                <Badge 
                  key={option.id}
                  variant={timeframe === option.value ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900 px-4 py-2"
                  onClick={() => setTimeframe(option.value as 'all' | 'month' | 'week')}
                >
                  {option.label}
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2" 
                onClick={() => refetch()}
                title="Refresh leaderboard"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-500">
                Error loading leaderboard data. Please try again.
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Leaderboard */}
            <div className="lg:col-span-2 space-y-6">
              {/* Top 3 Podium */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span>Top Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {topPerformers.map((performer, index) => (
                      <div 
                        key={performer.rank}
                        className={`text-center p-6 rounded-lg relative ${
                          index === 0 ? 'bg-gradient-to-b from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 order-2 md:order-1' :
                          index === 1 ? 'bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 order-1 md:order-2' :
                          'bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 order-3'
                        }`}
                      >
                        {/* Rank Badge */}
                        <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                          'bg-gradient-to-r from-orange-400 to-orange-600'
                        }`}>
                          {performer.rank}
                        </div>

                        {/* Avatar */}
                        <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                          'bg-gradient-to-r from-orange-500 to-orange-600'
                        }`}>
                          {performer.avatar}
                        </div>

                        {/* Name */}
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {performer.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">@{performer.username}</p>

                        {/* Stats */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Points:</span>
                            <span className="font-semibold">{performer.points.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Wins:</span>
                            <span className="font-semibold">{performer.eventsWon}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Win Rate:</span>
                            <span className="font-semibold">{performer.winRate}%</span>
                          </div>
                        </div>

                        {/* Trophy Icon */}
                        <div className="mt-4">
                          {index === 0 && <Trophy className="w-6 h-6 text-yellow-600 mx-auto" />}
                          {index === 1 && <Medal className="w-6 h-6 text-gray-600 mx-auto" />}
                          {index === 2 && <Award className="w-6 h-6 text-orange-600 mx-auto" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Other Rankings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Rankings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {otherRanks.map((participant) => (
                      <div 
                        key={participant.rank}
                        className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {/* Rank */}
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {participant.rank}
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                          {participant.avatar}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {participant.name}
                          </h3>
                          <p className="text-sm text-gray-500">@{participant.username}</p>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex space-x-6 text-sm">
                          <div className="text-center">
                            <div className="font-semibold">{participant.points.toLocaleString()}</div>
                            <div className="text-gray-500">Points</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{participant.eventsWon}</div>
                            <div className="text-gray-500">Wins</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{participant.winRate}%</div>
                            <div className="text-gray-500">Win Rate</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center">
                              {participant.streak > 0 ? (
                                <>
                                  <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                                  <span className="font-semibold text-yellow-600">{participant.streak}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                            <div className="text-gray-500">Streak</div>
                          </div>
                        </div>

                        {/* Mobile Stats */}
                        <div className="md:hidden text-right">
                          <div className="font-semibold">{participant.points.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{participant.eventsWon} wins</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Your Rank */}
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                    <Target className="w-5 h-5" />
                    <span>Your Position</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentUserRank ? (
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700">
                      {/* Rank */}
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {currentUserRank.rank}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        {currentUserRank.avatar}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {currentUserRank.name} (You)
                        </h3>
                        <p className="text-sm text-gray-500">@{currentUserRank.username}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{currentUserRank.points.toLocaleString()}</div>
                          <div className="text-gray-500">Points</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{currentUserRank.eventsWon}</div>
                          <div className="text-gray-500">Wins</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{currentUserRank.winRate}%</div>
                          <div className="text-gray-500">Win Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center">
                            {currentUserRank.streak > 0 ? (
                              <>
                                <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                                <span className="font-semibold text-yellow-600">{currentUserRank.streak}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                          <div className="text-gray-500">Streak</div>
                        </div>
                      </div>

                      {/* Mobile Stats */}
                      <div className="md:hidden text-right">
                        <div className="font-semibold">{currentUserRank.points.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{currentUserRank.eventsWon} wins</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Not Ranked Yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Participate in events to earn points and appear on the leaderboard!
                      </p>
                      <Button variant="outline" asChild>
                        <a href="/participant/events">Find Events</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentUserRank ? (
                    <>
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">#{currentUserRank.rank}</div>
                        <div className="text-sm text-gray-600">Current Rank</div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Points</span>
                          <span className="font-semibold">{currentUserRank.points.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Events Won</span>
                          <span className="font-semibold">{currentUserRank.eventsWon}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Events Joined</span>
                          <span className="font-semibold">{currentUserRank.eventsParticipated}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Win Rate</span>
                          <span className="font-semibold">{currentUserRank.winRate}%</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-gray-500">Participate in events to see your stats here</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Achievement Targets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Star className="w-5 h-5" />
                    <span>Next Milestones</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentUserRank ? (
                    <>
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Reach Top {Math.max(1, currentUserRank.rank - 10)}</span>
                          <Badge variant="outline">{currentUserRank.rank > 10 ? 10 : currentUserRank.rank - 1} ranks</Badge>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (1 - (currentUserRank.rank > 10 ? 10 : currentUserRank.rank - 1) / 10) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Keep participating to climb the ranks!</p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{currentUserRank.eventsWon + 1} Event Wins</span>
                          <Badge variant="outline">1 more</Badge>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(currentUserRank.eventsWon / (currentUserRank.eventsWon + 1)) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Win 1 more event</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-gray-500">Join events to unlock milestones</p>
                      <Button variant="outline" className="mt-4" asChild>
                        <a href="/participant/events">Browse Events</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Streak Card */}
              {currentUserRank && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <span>Current Streak</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">3-Win Streak</span>
                        <Badge variant="outline">{Math.max(0, 3 - currentUserRank.streak)} more</Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${(currentUserRank.streak / 3) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {currentUserRank.streak > 0 
                          ? `Current streak: ${currentUserRank.streak}. Win ${Math.max(0, 3 - currentUserRank.streak)} more in a row!` 
                          : 'Start your winning streak!'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
