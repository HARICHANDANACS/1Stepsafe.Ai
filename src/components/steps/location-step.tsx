'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserInput, AgeGroup, ActivityLevel } from '@/lib/data';

const formSchema = z.object({
  city: z.string().min(2, {
    message: 'City must be at least 2 characters.',
  }),
  ageGroup: z.enum(['Child', 'Adult', 'Elderly']).optional(),
  activityLevel: z.enum(['Low', 'Medium', 'High']).optional(),
});

type LocationStepProps = {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
};

export function LocationStep({ onSubmit, isLoading }: LocationStepProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: '',
    },
  });

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values as UserInput);
  }

  const handleDetectLocation = () => {
    setIsDetecting(true);
    // This is a mock detection. In a real app, you would use navigator.geolocation
    // and a reverse geocoding service.
    setTimeout(() => {
      const mockCity = 'New York';
      form.setValue('city', mockCity);
      toast({
        title: 'Location Detected',
        description: `Your location has been set to ${mockCity}.`,
      });
      setIsDetecting(false);
    }, 1500);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="e.g., San Francisco" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDetectLocation}
                        disabled={isDetecting}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        {isDetecting ? 'Detecting...' : 'Auto-detect'}
                      </Button>
                    </div>
                    <FormDescription>
                      Enter your city for accurate climate data.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ageGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Group (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Adult">Adult</SelectItem>
                          <SelectItem value="Elderly">Elderly</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {/* The main navigation is handled by the StepWrapper */}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
