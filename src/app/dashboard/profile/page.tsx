'use client';

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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  location: z.object({
    city: z.string().min(1, 'City is required'),
    lat: z.number().optional(),
    lon: z.number().optional(),
  }),
  routine: z.object({
    morningCommuteStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    workHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    eveningCommuteStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  commuteType: z.enum(['Walk', 'Bike', 'Public Transport', 'Drive']),
  sensitivities: z.object({
    heat: z.enum(['Low', 'Medium', 'High']),
    aqi: z.enum(['Yes', 'No']),
  }),
  healthProfile: z.object({
    ageRange: z.enum(['18-29', '30-49', '50-64', '65+']).optional().or(z.literal('')),
    skinType: z.enum(['Very Fair', 'Fair', 'Medium', 'Olive', 'Brown', 'Black']).optional().or(z.literal('')),
    respiratoryHealth: z.enum(['Good', 'Moderate', 'Sensitive']).optional().or(z.literal('')),
  }).optional(),
});

type ProfileFormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

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
        eveningCommuteStart: '17:00',
      },
      commuteType: 'Drive',
      sensitivities: { heat: 'Medium', aqi: 'No' },
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
    form.reset(data); 
    toast.success('Your profile has been saved!');
    router.push('/dashboard');
  };

  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div className="mx-auto grid max-w-4xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Your Personal Profile
            </h1>
        </div>
        {isLoading ? (
        <p>Loading your profile...</p>
        ) : user ? (
        <Card>
            <CardHeader>
            <CardDescription>
                This information helps StepSafe AI provide personalized
                climate-health guidance. It is saved securely and never
                shared.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <UserProfileForm
                form={form}
                onSave={handleSaveProfile}
            />
            </CardContent>
        </Card>
        ) : (
        <p>Please log in to manage your profile.</p>
        )}
    </div>
  );
}
