'use client';

import { Header } from '@/components/layout/header';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfileForm } from './_components/user-profile-form';
import type { UserProfile } from '@/lib/data';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const handleSaveProfile = (data: Partial<UserProfile>) => {
    if (!userProfileRef) return;
    const profileData: UserProfile = {
      id: user!.uid,
      location: data.location || { city: '', lat: 0, lon: 0 },
      routine: data.routine || { morningCommuteStart: '08:00', workHoursStart: '09:00', lunchStart: '12:00', eveningCommuteStart: '17:00' },
      commuteType: data.commuteType || 'Drive',
      sensitivities: data.sensitivities || { heat: 'Medium', aqi: 'Medium', uv: 'Medium' },
    };
    setDocumentNonBlocking(userProfileRef, profileData, { merge: true });
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
