'use client';
import { useState, useEffect, useCallback } from 'react';
import { type UseFormReturn } from 'react-hook-form';
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
import { MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  city: z.string().min(2, {
    message: 'City must be at least 2 characters.',
  }),
  ageGroup: z.enum(['Child', 'Adult', 'Elderly']).optional(),
  activityLevel: z.enum(['Low', 'Medium', 'High']).optional(),
});

type LocationStepProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  isLoading: boolean;
};

type Suggestion = {
  display_name: string;
  name: string;
};

// Debounce function
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeoutId: NodeJS.Timeout;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function LocationStep({ form, isLoading }: LocationStepProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if (!navigator.geolocation) {
      toast({
        variant: 'destructive',
        title: 'Geolocation is not supported',
        description: 'Your browser does not support geolocation.',
      });
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch location data');
          }
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village;

          if (city) {
            form.setValue('city', city, { shouldValidate: true });
            toast({
              title: 'Location Detected',
              description: `Your location has been set to ${city}.`,
            });
          } else {
            throw new Error("Could not determine city from location.");
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast({
            variant: 'destructive',
            title: 'Location Detection Failed',
            description: 'Could not automatically determine your city.',
          });
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        let errorMessage = 'An unknown error occurred.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'You denied the request for Geolocation.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
        }
        toast({
          variant: 'destructive',
          title: 'Location Detection Failed',
          description: errorMessage,
        });
        setIsDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };
  
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&format=json&limit=5&accept-language=en`
      );
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data: Suggestion[] = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('City search error:', error);
      // Silently fail, don't show toast for autocomplete
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), [fetchSuggestions]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'city' && value.city) {
        debouncedFetchSuggestions(value.city);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedFetchSuggestions]);

  const handleSuggestionClick = (suggestion: Suggestion) => {
    form.setValue('city', suggestion.name, { shouldValidate: true });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <Card className="max-w-2xl mx-auto bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                     <Popover open={showSuggestions} onOpenChange={setShowSuggestions}>
                       <PopoverAnchor asChild>
                        <div className="flex gap-2">
                          <FormControl>
                            <div className="relative w-full">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input placeholder="e.g., San Francisco" {...field} autoComplete="off" className="pl-10" />
                            </div>
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleDetectLocation}
                            disabled={isDetecting || isLoading}
                            className="shrink-0"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            {isDetecting ? 'Detecting...' : 'Auto-detect'}
                          </Button>
                        </div>
                       </PopoverAnchor>
                       <PopoverContent className="w-[--radix-popover-trigger-width] p-1" align="start">
                        {isSearching ? (
                            <div className="p-2 space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-2/3" />
                            </div>
                        ) : suggestions.length > 0 ? (
                           suggestions.map((s, i) => (
                             <button
                                key={i}
                                type="button"
                                onClick={() => handleSuggestionClick(s)}
                                className="w-full text-left p-2 text-sm rounded-sm hover:bg-accent"
                             >
                               {s.display_name}
                             </button>
                           ))
                        ) : (
                            <p className="p-2 text-sm text-muted-foreground">No results found.</p>
                        )}
                       </PopoverContent>
                     </Popover>
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
                      <FormLabel>Age Group (Optional)</FormLabel>                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                        value={field.value}
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
