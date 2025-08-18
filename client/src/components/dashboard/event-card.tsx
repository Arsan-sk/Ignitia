import { Button } from "@/components/ui/button";
import { Clock, Users, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    type: string;
    bannerUrl?: string;
    startAt: string;
    endAt: string;
  };
  progress?: number;
  roundInfo?: string;
  teamName?: string;
}

export default function EventCard({ event, progress = 0, roundInfo, teamName }: EventCardProps) {
  const getDaysLeft = () => {
    const days = Math.ceil((new Date(event.endAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days}d left` : 'Ended';
  };

  const getTypeColor = () => {
    switch (event.type) {
      case 'hackathon':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'conference':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'meetup':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  const getProgressColor = () => {
    if (progress >= 75) return 'from-green-400 to-emerald-500';
    if (progress >= 50) return 'from-blue-400 to-cyan-500';
    if (progress >= 25) return 'from-yellow-400 to-orange-500';
    return 'from-light-primary to-purple-500';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 card-hover border border-gray-200 dark:border-gray-700 overflow-hidden">
      {event.bannerUrl && (
        <img 
          src={event.bannerUrl} 
          alt={`${event.title} banner`} 
          className="w-full h-32 object-cover" 
        />
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeColor()}`}>
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Badge>
          {roundInfo && (
            <span className="text-xs text-gray-500">{roundInfo}</span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          {teamName && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Team: {teamName}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">{getDaysLeft()}</span>
          </div>
        </div>

        {progress > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${getProgressColor()} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex space-x-2 mt-4">
          <Button className="flex-1 bg-light-primary dark:bg-dark-primary text-white hover:bg-blue-700 dark:hover:bg-purple-700">
            Continue
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
