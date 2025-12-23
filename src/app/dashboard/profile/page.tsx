'use client';

import { Header } from '@/components/layout/header';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { UserProfileForm } from './_components/user-profile-form';
import type { UserProfile } from '@/lib/data';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';

const formSchema = z.object({
  location: z.object({
    city: z.string().min(1, 'City is required'),
    lat: z.number().optional(),
    lon: z.number().optional(),
  }),
  routine: z.object({
    morningCommuteStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    workHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    lunchStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    eveningCommuteStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  commuteType: z.enum(['Walk', 'Bike', 'Public Transport', 'Drive']),
  sensitivities: z.object({
    heat: z.enum(['Low', 'Medium', 'High']),
    aqi: z.enum(['Low', 'Medium', 'High']),
    uv: z.enum(['Low', 'Medium', 'High']),
  }),
  healthProfile: z.object({
    ageRange: z.enum(['18-29', '30-49', '50-64', '65+']).optional(),
    skinType: z.enum(['Very Fair', 'Fair', 'Medium', 'Olive', 'Brown', 'Black']).optional(),
    respiratoryHealth: z.enum(['Good', 'Moderate', 'Sensitive']).optional(),
  }).optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: { city: '' },
      routine: {
        morningCommuteStart: '08:00',
        workHoursStart: '09:00',
        lunchStart: '12:00',
        eveningCommuteStart: '17:00',
      },
      commuteType: 'Drive',
      sensitivities: { heat: 'Medium', aqi: 'Medium', uv: 'Medium' },
      healthProfile: {
        ageRange: undefined,
        skinType: undefined,
        respiratoryHealth: undefined,
      },
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset(userProfile);
    }
  }, [userProfile, form]);

  const handleSaveProfile = (data: ProfileFormValues) => {
    if (!userProfileRef || !user) return;

    const profileData = {
      ...data,
      id: user.uid,
    };

    setDocumentNonBlocking(userProfileRef, profileData, { merge: true });
    form.reset(data); // Reset the form with the new data to update dirty state
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
                  This information helps StepSafe AI provide personalized
                  climate-health guidance. It is saved securely and never
                  shared.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserProfileForm
                  form={form as UseFormReturn<any>}
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
