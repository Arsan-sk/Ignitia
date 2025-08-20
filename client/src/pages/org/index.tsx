import { useEffect } from "react";
import { Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function OrgIndex() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading } = useQuery({ 
    queryKey: ["/api/orgs/mine"], 
    enabled: !!user && user.role === 'organizer', // Only query if user is an organizer
    retry: false 
  });

  if (authLoading || isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  // Redirect non-authenticated users
  if (!user) return <Redirect to="/login" />;
  
  // Redirect participants to their dashboard
  if (user.role !== 'organizer') return <Redirect to="/dashboard" />;

  const first = (data as any[])?.[0];
  if (!first) return <Redirect to="/dashboard" />;

  return <Redirect to={`/org/${first.id}/home`} />;
}
