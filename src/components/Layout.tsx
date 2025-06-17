import { BottomBar } from "./BottomBar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {children}
      <BottomBar />
    </div>
  );
}; 