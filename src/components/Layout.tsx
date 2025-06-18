
import { BottomBar } from "./BottomBar";
import { TopBar } from "./TopBar";

interface LayoutProps {
  children: React.ReactNode;
  customTitle?: string;
  showBackButton?: boolean;
}

export const Layout = ({ children, customTitle, showBackButton }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar customTitle={customTitle} showBackButton={showBackButton} />
      <div className="pt-14 pb-14">
        {children}
      </div>
      <BottomBar />
    </div>
  );
}; 
