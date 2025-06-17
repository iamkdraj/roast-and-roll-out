
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Palette, Bell, Shield, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserNav } from "@/components/UserNav";
import { useTheme } from "@/hooks/useTheme";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [showNSFW, setShowNSFW] = useState(localStorage.getItem('showNSFW') === 'true');
  const [notifications, setNotifications] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState(localStorage.getItem('appTheme') || 'default');

  const themes = [
    { id: 'default', name: 'Default', icon: '🎨', colors: 'bg-gray-900 border-orange-500' },
    { id: 'retro', name: 'Retro', icon: '📺', colors: 'bg-purple-900 border-pink-500' },
    { id: 'futuristic', name: 'Futuristic', icon: '🚀', colors: 'bg-blue-900 border-cyan-400' },
    { id: 'nature', name: 'Nature', icon: '🌿', colors: 'bg-green-900 border-green-400' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: '🤖', colors: 'bg-black border-lime-400' },
    { id: 'minimalist', name: 'Minimalist', icon: '⚪', colors: 'bg-slate-100 border-slate-400' },
    { id: 'steampunk', name: 'Steampunk', icon: '⚙️', colors: 'bg-amber-900 border-amber-600' },
    { id: 'vaporwave', name: 'Vaporwave', icon: '🌸', colors: 'bg-pink-900 border-purple-400' },
    { id: 'anime', name: 'Anime', icon: '🌸', colors: 'bg-rose-900 border-rose-400' },
    { id: 'space', name: 'Space', icon: '🌌', colors: 'bg-indigo-900 border-purple-500' },
    { id: 'underwater', name: 'Underwater', icon: '🌊', colors: 'bg-teal-900 border-blue-400' },
  ];

  const handleNSFWToggle = (value: boolean) => {
    setShowNSFW(value);
    localStorage.setItem('showNSFW', value.toString());
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('appTheme', themeId);
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', themeId);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-orange-500">Settings</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Appearance Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-orange-500 flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Dark Mode</h3>
                <p className="text-sm text-gray-400">Toggle between light and dark mode</p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>

            <div>
              <h3 className="font-medium text-white mb-4">App Theme</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {themes.map((themeOption) => (
                  <div
                    key={themeOption.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                      selectedTheme === themeOption.id
                        ? themeOption.colors
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => handleThemeSelect(themeOption.id)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{themeOption.icon}</div>
                      <div className="text-sm font-medium text-white">{themeOption.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-orange-500 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Show NSFW Content</h3>
                <p className="text-sm text-gray-400">Always show NSFW posts in your feed</p>
              </div>
              <Switch
                checked={showNSFW}
                onCheckedChange={handleNSFWToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-orange-500 flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Push Notifications</h3>
                <p className="text-sm text-gray-400">Receive notifications for votes and replies</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-orange-500 flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span>Language</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="font-medium text-white mb-2">App Language</h3>
              <p className="text-sm text-gray-400">Currently: English</p>
              <p className="text-xs text-gray-500 mt-1">More languages coming soon!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
