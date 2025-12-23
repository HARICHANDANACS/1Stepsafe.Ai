'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserProfile, CommuteType, ClimateSensitivity } from '@/lib/data';
import { useEffect } from 'react';

const formSchema = z.object({
  location: z.object({
    city: z.string().min(1, 'City is required'),
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
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface UserProfileFormProps {
  userProfile: UserProfile | null;
  onSave: (data: Partial<UserProfile>) => void;
}

const SENSITIVITY_LEVELS: ClimateSensitivity[] = ['Low', 'Medium', 'High'];
const COMMUTE_TYPES: CommuteType[] = ['Walk', 'Bike', 'Public Transport', 'Drive'];

export function UserProfileForm({ userProfile, onSave }: UserProfileFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        location: {
          city: userProfile.location?.city || '',
        },
        routine: userProfile.routine || { morningCommuteStart: '08:00', workHoursStart: '09:00', lunchStart: '12:00', eveningCommuteStart: '17:00' },
        commuteType: userProfile.commuteType || 'Drive',
        sensitivities: userProfile.sensitivities || { heat: 'Medium', aqi: 'Medium', uv: 'Medium' },
      });
    }
  }, [userProfile, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    // A real implementation would geocode the city to get lat/lon
    const submissionData: Partial<UserProfile> = {
      ...data,
      location: {
        city: data.location.city,
        lat: 0, // Placeholder
        lon: 0, // Placeholder
      },
    };
    onSave(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Location</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="city">Your Primary City</Label>
            <Input id="city" {...register('location.city')} placeholder="e.g., San Francisco" />
            {errors.location?.city && <p className="text-sm text-destructive">{errors.location.city.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Daily Routine</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="morningCommuteStart">Morning Commute</Label>
            <Input id="morningCommuteStart" type="time" {...register('routine.morningCommuteStart')} />
          </div>
          <div>
            <Label htmlFor="workHoursStart">Work Day Starts</Label>
            <Input id="workHoursStart" type="time" {...register('routine.workHoursStart')} />
          </div>
          <div>
            <Label htmlFor="lunchStart">Lunch Break</Label>
            <Input id="lunchStart" type="time" {...register('routine.lunchStart')} />
          </div>
          <div>
            <Label htmlFor="eveningCommuteStart">Evening Commute</Label>
            <Input id="eveningCommuteStart" type="time" {...register('routine.eveningCommuteStart')} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Commute & Sensitivities</h3>
        <div className="grid grid-cols-2 gap-4">
        <div>
            <Label>Primary Commute</Label>
            <Controller
              name="commuteType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select commute type" /></SelectTrigger>
                  <SelectContent>
                    {COMMUTE_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Heat Sensitivity</Label>
            <Controller
              name="sensitivities.heat"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {SENSITIVITY_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label>Air Quality (AQI) Sensitivity</Label>
             <Controller
              name="sensitivities.aqi"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {SENSITIVITY_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label>UV Sensitivity</Label>
             <Controller
              name="sensitivities.uv"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {SENSITIVITY_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}
