'use client';

import { Header } from '@/components/layout/header';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfileForm } from './_components/user-profile-form';
import type { UserProfile } from '@/lib/data';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  
  const { reset } = useForm<UserProfile>();

  const handleSaveProfile = (data: Partial<UserProfile>) => {
    if (!userProfileRef || !user) return;
    
    // Construct the full profile object, ensuring the ID is always present.
    const profileData = {
      ...data,
      id: user.uid,
    };
    
    setDocumentNonBlocking(userProfileRef, profileData, { merge: true });
    
    // After saving, reset the form with the new data to update the dirty state.
    reset(data as UserProfile);
  };

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <p>Loading your profile...</p>
          ) : user ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Personal Profile</CardTitle>
                <CardDescription>
                  This information helps StepSafe AI provide personalized climate-health guidance. It is saved securely and never shared.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfileForm
                  userProfile={userProfile}
                  onSave={handleSaveProfile}
                  reset={reset}
                />
              </CardContent>
            </Card>
          ) : (
            <p>Please log in to manage your profile.</p>
          )}
        </div>
      </main>
    </div>
  );
}
