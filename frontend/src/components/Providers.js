'use client';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './AuthProvider';

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
