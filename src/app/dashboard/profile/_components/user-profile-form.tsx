'use client';

import { useForm, Controller, UseFormReturn } from 'react-hook-form';
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
import type {
  CommuteType,
  ClimateSensitivity,
  AgeRange,
  SkinType,
  RespiratoryHealth,
  YesNo,
} from '@/lib/data';
import { useState } from 'react';
import { Info, LocateFixed } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface UserProfileFormProps {
  form: UseFormReturn<any>;
  onSave: (data: any) => void;
}

const HEAT_SENSITIVITY_LEVELS: ClimateSensitivity[] = ['Low', 'Medium', 'High'];
const AQI_SENSITIVITY_LEVELS: YesNo[] = ['Yes', 'No'];
const COMMUTE_TYPES: CommuteType[] = [
  'Walk',
  'Bike',
  'Public Transport',
  'Drive',
];
const AGE_RANGES: AgeRange[] = ['18-29', '30-49', '50-64', '65+'];
const SKIN_TYPES: SkinType[] = ['Very Fair', 'Fair', 'Medium', 'Olive', 'Brown', 'Black'];
const RESPIRATORY_HEALTHS: RespiratoryHealth[] = ['Good', 'Moderate', 'Sensitive'];


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

export function UserProfileForm({ form, onSave }: UserProfileFormProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const handleDetectLocation = () => {
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            'Unknown location';
          setValue('location.city', city, { shouldDirty: true });
          setValue('location.lat', latitude, { shouldDirty: true });
          setValue('location.lon', longitude, { shouldDirty: true });
        } catch (error) {
          console.error('Error fetching city name:', error);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsDetecting(false);
      }
    );
  };

  const renderTimeSelector = (name: string, label: string) => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
       <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
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
    </div>
  );
  
  const renderSensitivitySelector = (name: string, label: string, explanation: string, levels: string[]) => (
     <div className="space-y-2">
        <div className="flex items-center gap-2">
           <Label>{label}</Label>
           <TooltipProvider>
              <Tooltip>
                 <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                 </TooltipTrigger>
                 <TooltipContent>
                    <p className="max-w-xs">{explanation}</p>
                 </TooltipContent>
              </Tooltip>
           </TooltipProvider>
        </div>
        <Controller
           name={name}
           control={control}
           render={({ field }) => (
           <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                 <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                 {levels.map((level) => (
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

  const renderHealthSelector = (name: string, label: string, explanation: string, options: string[]) => (
    <div className="space-y-2">
       <div className="flex items-center gap-2">
          <Label>{label}</Label>
          <TooltipProvider>
             <Tooltip>
                <TooltipTrigger asChild>
                   <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                   <p className="max-w-xs">{explanation}</p>
                </TooltipContent>
             </Tooltip>
          </TooltipProvider>
       </div>
       <Controller
          name={name}
          control={control}
          render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value || ''}>
             <SelectTrigger>
                <SelectValue placeholder="Select an option" />
             </SelectTrigger>
             <SelectContent>
                {options.map((option) => (
                <SelectItem key={option} value={option}>
                   {option}
                </SelectItem>
                ))}
              </SelectContent>
           </Select>
          )}
          />
    </div>
 );


  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-8">
      {/* --- Section: Core Info --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Core Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g., Jane Doe" />
            {errors.name && <p className="text-sm text-destructive">{(errors.name as any).message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Your Primary City</Label>
            <div className="flex items-center gap-2">
              <Input id="city" {...register('location.city')} placeholder="e.g., San Francisco" />
              <Button type="button" variant="outline" size="icon" onClick={handleDetectLocation} disabled={isDetecting}>
                <LocateFixed className="h-4 w-4" />
              </Button>
            </div>
            {errors.location?.city && <p className="text-sm text-destructive">{(errors.location as any).city.message}</p>}
          </div>
        </div>
      </div>

      <Separator />

      {/* --- Section: Daily Routine --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Daily Routine</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {renderTimeSelector('routine.morningCommuteStart', 'Morning Commute Starts')}
          {renderTimeSelector('routine.workHoursStart', 'Work Day Starts')}
          {renderTimeSelector('routine.eveningCommuteStart', 'Evening Commute Starts')}
        </div>
      </div>

      <Separator />
      
      {/* --- Section: Commute & Sensitivities --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Commute & Climate Sensitivities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-1">
                <Label>Primary Commute Type</Label>
                <Controller
                  name="commuteType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select commute type" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMUTE_TYPES.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
           {renderSensitivitySelector( 'sensitivities.heat', 'Heat Sensitivity', 'How much hot weather affects your well-being and ability to function.', HEAT_SENSITIVITY_LEVELS )}
           {renderSensitivitySelector( 'sensitivities.aqi', 'Air Quality (AQI) Sensitivity', 'Answer "Yes" if you have any respiratory conditions or are sensitive to air pollution.', AQI_SENSITIVITY_LEVELS )}
        </div>
      </div>

      <Separator />
      
      {/* --- Section: Health Profile --- */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Health Profile (Optional)</h3>
        <p className="text-sm text-muted-foreground">Providing this information allows for more tailored and accurate recommendations.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {renderHealthSelector( 'healthProfile.ageRange', 'Age Range', 'Age can influence sensitivity to heat and other environmental factors.', AGE_RANGES )}
           {renderHealthSelector( 'healthProfile.skinType', 'Skin Type (Fitzpatrick Scale)', 'Helps determine your skin\'s sensitivity to UV radiation. Type I (Very Fair) burns easily, while Type VI (Black) is least sensitive.', SKIN_TYPES )}
           {renderHealthSelector('healthProfile.respiratoryHealth', 'Respiratory Health', 'If you have conditions like asthma, your sensitivity to air quality changes may be higher.', RESPIRATORY_HEALTHS)}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting || !isDirty} size="lg">
        {isSubmitting ? 'Saving...' : 'Save Profile & View Dashboard'}
      </Button>
    </form>
  );
}
