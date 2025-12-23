'use client';

import { useForm, Controller, UseFormReset } from 'react-hook-form';
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
import { useEffect, useState } from 'react';
import { Info, LocateFixed } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface UserProfileFormProps {
  userProfile: UserProfile | null;
  onSave: (data: ProfileFormValues) => void;
  reset: UseFormReset<ProfileFormValues>;
}

const SENSITIVITY_LEVELS: ClimateSensitivity[] = ['Low', 'Medium', 'High'];
const COMMUTE_TYPES: CommuteType[] = [
  'Walk',
  'Bike',
  'Public Transport',
  'Drive',
];

// Generate time options in 30-minute increments
const generateTimeOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      options.push(`${hour}:${minute}`);
    }
  }
  return options;
};
const timeOptions = generateTimeOptions();

export function UserProfileForm({ userProfile, onSave, reset }: UserProfileFormProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        location: {
          city: userProfile.location?.city || '',
          lat: userProfile.location?.lat,
          lon: userProfile.location?.lon,
        },
        routine: userProfile.routine || {
          morningCommuteStart: '08:00',
          workHoursStart: '09:00',
          lunchStart: '12:00',
          eveningCommuteStart: '17:00',
        },
        commuteType: userProfile.commuteType || 'Drive',
        sensitivities: userProfile.sensitivities || {
          heat: 'Medium',
          aqi: 'Medium',
          uv: 'Medium',
        },
      });
    }
  }, [userProfile, reset]);

  const handleDetectLocation = () => {
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Simple reverse geocoding to get city name
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || 'Unknown location';
          setValue('location.city', city, { shouldDirty: true });
          setValue('location.lat', latitude, { shouldDirty: true });
          setValue('location.lon', longitude, { shouldDirty: true });
        } catch (error) {
          console.error("Error fetching city name:", error);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetecting(false);
      }
    );
  };

  const onSubmit = (data: ProfileFormValues) => {
    onSave(data);
  };
  
  const renderTimeSelector = (name: keyof ProfileFormValues['routine']) => (
     <Controller
        name={`routine.${name}`}
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
  );
  
  const renderSensitivitySelector = (name: keyof ProfileFormValues['sensitivities'], label: string, explanation: string) => (
     <div>
        <div className="flex items-center gap-2 mb-2">
           <Label>{label}</Label>
           <TooltipProvider>
              <Tooltip>
                 <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                 </TooltipTrigger>
                 <TooltipContent>
                    <p className="max-w-xs">{explanation}</p>
                 </TooltipContent>
              </Tooltip>
           </TooltipProvider>
        </div>
        <Controller
           name={`sensitivities.${name}`}
           control={control}
           render={({ field }) => (
           <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                 <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                 {SENSITIVITY_LEVELS.map((level) => (
                 <SelectItem key={level} value={level}>
                    {level}
                 </SelectItem>
                 ))}
              </SelectContent>
           </Select>
           )}
           />
     </div>
  );


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Location</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="city">Your Primary City</Label>
            <div className="flex items-center gap-2">
              <Input
                id="city"
                {...register('location.city')}
                placeholder="e.g., San Francisco"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleDetectLocation} disabled={isDetecting}>
                <LocateFixed className="h-4 w-4" />
              </Button>
            </div>
            {errors.location?.city && (
              <p className="text-sm text-destructive">
                {errors.location.city.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Daily Routine</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="morningCommuteStart">Morning Commute</Label>
            {renderTimeSelector('morningCommuteStart')}
          </div>
          <div>
            <Label htmlFor="workHoursStart">Work Day Starts</Label>
            {renderTimeSelector('workHoursStart')}
          </div>
          <div>
            <Label htmlFor="lunchStart">Lunch Break</Label>
            {renderTimeSelector('lunchStart')}
          </div>
          <div>
            <Label htmlFor="eveningCommuteStart">Evening Commute</Label>
            {renderTimeSelector('eveningCommuteStart')}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Commute & Sensitivities</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Primary Commute</Label>
            <Controller
              name="commuteType"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select commute type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUTE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {renderSensitivitySelector( 'heat', 'Heat Sensitivity', 'How much hot weather affects your well-being and ability to function.' )}
           {renderSensitivitySelector( 'aqi', 'Air Quality (AQI) Sensitivity', 'How sensitive you are to pollutants and particles in the air, which can affect breathing and overall health.' )}
           {renderSensitivitySelector('uv', 'UV Sensitivity', 'How easily your skin reacts to sun exposure. Higher sensitivity means a greater need for sun protection.')}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}
