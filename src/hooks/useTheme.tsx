import { createContext, useContext, ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
};

export const useTheme = () => {
  const context = useContext(NextThemesProvider);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
