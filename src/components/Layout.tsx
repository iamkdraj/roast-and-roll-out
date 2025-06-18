
import { BottomBar } from "./BottomBar";
import { TopBar } from "./TopBar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <div className="pt-16 pb-16">
        {children}
      </div>
      <BottomBar />
    </div>
  );
}; 
