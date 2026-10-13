import './globals.css';
import { StudioApolloProvider } from '../lib/apollo';

export const metadata = {
  title: 'StudioForge — High-Throughput GenAI Visual Engine',
  description: 'Enterprise text-to-image and video diffusion studio with real-time inference orchestration.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#090a0f] text-slate-100 min-h-screen">
        <StudioApolloProvider>
          {children}
        </StudioApolloProvider>
      </body>
    </html>
  );
}
