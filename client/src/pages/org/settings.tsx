import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OrgTopBar from "@/components/layout/org-topbar";
import OrgTabs from "@/components/layout/org-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Save, Upload, Trash2, Shield, Users, Bell, Palette, 
  Globe, Mail, MapPin, Twitter, Linkedin, Instagram, Github,
  Settings, Eye, EyeOff, AlertTriangle, Crown, Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function OrgSettings() {
  const params = useParams();
  const orgId = params?.orgId as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);

  // Get organization data
  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ["/api/orgs", orgId],
    enabled: !!orgId
  });

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    bannerUrl: "",
    website: "",
    email: "",
    location: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    github: "",
    mission: "",
    // Privacy settings
    isPublic: true,
    allowRegistrations: true,
    requireApproval: false,
    // Notification settings
    emailNotifications: true,
    eventUpdates: true,
    participantUpdates: true,
    systemUpdates: false
  });

  // Update form data when organization loads
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        description: organization.description || "",
        logoUrl: organization.logoUrl || "",
        bannerUrl: organization.bannerUrl || "",
        website: organization.website || "",
        email: organization.email || "",
        location: organization.location || "",
        twitter: organization.twitter || "",
        linkedin: organization.linkedin || "",
        instagram: organization.instagram || "",
        github: organization.github || "",
        mission: organization.mission || "",
        isPublic: organization.isPublic ?? true,
        allowRegistrations: organization.allowRegistrations ?? true,
        requireApproval: organization.requireApproval ?? false,
        emailNotifications: organization.emailNotifications ?? true,
        eventUpdates: organization.eventUpdates ?? true,
        participantUpdates: organization.participantUpdates ?? true,
        systemUpdates: organization.systemUpdates ?? false
      });
    }
  }, [organization]);

  const updateOrgMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/orgs/${orgId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orgs", orgId] });
      toast({
        title: "Settings Updated",
        description: "Organization settings have been updated successfully."
      });
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  });

  const handleSubmit = (section: string) => {
    setIsLoading(true);
    let updateData: any = {};

    switch (section) {
      case "general":
        updateData = {
          name: formData.name,
          description: formData.description,
          logoUrl: formData.logoUrl,
          bannerUrl: formData.bannerUrl,
          mission: formData.mission
        };
        break;
      case "contact":
        updateData = {
          website: formData.website,
          email: formData.email,
          location: formData.location
        };
        break;
      case "social":
        updateData = {
          twitter: formData.twitter,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          github: formData.github
        };
        break;
      case "privacy":
        updateData = {
          isPublic: formData.isPublic,
          allowRegistrations: formData.allowRegistrations,
          requireApproval: formData.requireApproval
        };
        break;
      case "notifications":
        updateData = {
          emailNotifications: formData.emailNotifications,
          eventUpdates: formData.eventUpdates,
          participantUpdates: formData.participantUpdates,
          systemUpdates: formData.systemUpdates
        };
        break;
    }

    updateOrgMutation.mutate(updateData);
  };

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <OrgTopBar />
        <OrgTabs orgId={orgId} />
        <main className="max-w-4xl mx-auto container-padding section-spacing">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <OrgTopBar />
      <OrgTabs orgId={orgId} />

      <main className="max-w-4xl mx-auto container-padding section-spacing">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your organization profile, privacy settings, and preferences.
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span>Organization Profile</span>
                </CardTitle>
                <CardDescription>
                  Basic information about your organization that appears on your profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo and Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Organization Logo</Label>
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={formData.logoUrl} alt="Logo" />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {formData.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Input
                          id="logoUrl"
                          placeholder="https://example.com/logo.png"
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                        />
                        <Button size="sm" variant="outline" className="mt-2">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bannerUrl">Banner Image</Label>
                    <div className="space-y-2">
                      <Input
                        id="bannerUrl"
                        placeholder="https://example.com/banner.png"
                        value={formData.bannerUrl}
                        onChange={(e) => setFormData({...formData, bannerUrl: e.target.value})}
                      />
                      {formData.bannerUrl && (
                        <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img 
                            src={formData.bannerUrl} 
                            alt="Banner preview" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of your organization"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mission">Mission Statement</Label>
                    <Textarea
                      id="mission"
                      rows={4}
                      value={formData.mission}
                      onChange={(e) => setFormData({...formData, mission: e.target.value})}
                      placeholder="Your organization's mission and values"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSubmit("general")}
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would continue here... */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Settings</CardTitle>
                <CardDescription>
                  Contact information and social links coming soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Contact settings will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Social media integration coming soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Social media settings will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Privacy and permission controls coming soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Privacy settings will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Notification preferences coming soon.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Notification settings will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
