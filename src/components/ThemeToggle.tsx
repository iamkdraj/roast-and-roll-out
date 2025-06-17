
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium text-foreground">Dark Mode</h3>
        <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="w-12 h-12 rounded-full border border-border"
      >
        {theme === "light" ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
};
