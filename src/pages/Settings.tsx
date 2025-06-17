import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Palette, Bell, Shield, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [showNSFW, setShowNSFW] = useState(localStorage.getItem('showNSFW') === 'true');
  const [notifications, setNotifications] = useState(true);

  const handleNSFWToggle = (value: boolean) => {
    setShowNSFW(value);
    localStorage.setItem('showNSFW', value.toString());
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="absolute left-0 text-primary p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary">Settings</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Appearance Settings */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Dark Mode</h3>
                <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Show NSFW Content</h3>
                <p className="text-sm text-muted-foreground">Always show NSFW posts in your feed</p>
              </div>
              <Switch
                checked={showNSFW}
                onCheckedChange={handleNSFWToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-foreground">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive notifications for votes and replies</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Language</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-medium text-foreground mb-2">App Language</h3>
              <p className="text-sm text-muted-foreground">Currently: English</p>
              <p className="text-xs text-muted-foreground mt-1">More languages coming soon!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
