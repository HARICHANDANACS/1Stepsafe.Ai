'use client';

import { Header } from '@/components/layout/header';
import { useUser } from '@/firebase';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Dashboard
          </h1>
          <div className="mt-8">
            {isUserLoading ? (
              <p>Loading user state...</p>
            ) : user ? (
              <p>Welcome, user {user.uid}. Your personalized dashboard is coming soon.</p>
            ) : (
              <p>Please log in to see your dashboard.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
