'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { AlertCircle, Compass, Loader2, MapPin, PersonStanding, Bike, Car } from 'lucide-react';
import type { ClimateData } from '@/lib/data';
import { getClimateDataForCity } from '@/lib/climate-service';
import { analyzeRisks } from '@/lib/risk-engine';
import type { Risk } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Location {
  lat: number;
  lon: number;
  city?: string;
}

type AvatarType = '🚶' | '🚲' | '🚗' | '🧍';

const avatars: { value: AvatarType, label: string, icon: React.ComponentType<{className?: string}> }[] = [
    { value: '🧍', label: 'Person', icon: PersonStanding },
    { value: '🚶', label: 'Walking', icon: PersonStanding },
    { value: '🚲', label: 'Biking', icon: Bike },
    { value: '🚗', label: 'Driving', icon: Car },
]

const SuggestionCard = ({ risks }: { risks: Risk[] }) => {
    return (
        <Card className="bg-accent/50 border-accent">
            <CardHeader>
                <CardTitle>Real-time Suggestions</CardTitle>
                <CardDescription>Based on your current location and conditions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {risks.map((risk) => (
                    <div key={risk.name} className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <risk.Icon className="h-5 w-5 text-accent-foreground/80" />
                        </div>
                        <div>
                            <p className="font-semibold">{risk.name}: {risk.level}</p>
                            <p className="text-sm text-accent-foreground/90">{risk.explanation}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export default function LiveMapPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapUrl, setMapUrl] = useState<string>('');
  const [avatar, setAvatar] = useState<AvatarType>('🧍');

  const handleLocationUpdate = useCallback(async (position: GeolocationPosition) => {
    setIsLoading(true);
    const { latitude, longitude } = position.coords;
    const newLocation = { lat: latitude, lon: longitude };
    setLocation(newLocation);

    try {
      const data = await getClimateDataForCity(latitude, longitude);
      setClimateData(data);
      const analyzedRisks = analyzeRisks(data);
      const topRisks = Object.values(analyzedRisks).filter(risk => risk.level !== 'Low').slice(0, 3);
      setRisks(topRisks.length > 0 ? topRisks : [analyzedRisks.heatRisk]);

       setMapUrl(`https://render.openstreetmap.org/cgi-bin/export?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layers=mapnik`);

    } catch (e) {
      setError('Could not fetch climate data for your location.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsTracking(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(handleLocationUpdate, () => {
        setError('Unable to retrieve your location. Please enable location services.');
        setIsTracking(false);
    });
  };

  useEffect(() => {
    let watchId: number;
    if (isTracking) {
      watchId = navigator.geolocation.watchPosition(handleLocationUpdate, () => {
         setError('Lost location access. Please re-enable if you want live updates.');
         setIsTracking(false);
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 });
    }
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isTracking, handleLocationUpdate]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Environmental Map</CardTitle>
            <CardDescription>
              Real-time tracking of your environmental exposure as you move.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
            {!isTracking ? (
                <>
                    <Compass className="w-16 h-16 text-muted-foreground" />
                    <p className="text-muted-foreground">Start tracking to see your live location and get real-time suggestions.</p>
                    <Button onClick={startTracking} size="lg">
                        <MapPin className="mr-2 h-4 w-4" /> Start Live Tracking
                    </Button>
                </>
            ): (
                <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center relative">
                    {isLoading && !mapUrl && <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />}
                    {error && <p className="text-destructive-foreground">{error}</p>}
                    {mapUrl && (
                      <>
                        <Image 
                            src={mapUrl} 
                            alt="Map of current location"
                            fill
                            className="rounded-md object-cover"
                        />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-pulse">
                          {avatar}
                        </div>
                      </>
                    )}
                </div>
            )}
          </CardContent>
        </Card>
        {isTracking && (
            <Card>
                <CardHeader>
                    <CardTitle>Map &amp; Location</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm items-center">
                    <div className="font-semibold">Avatar:</div>
                    <div>
                         <Select value={avatar} onValueChange={(value: AvatarType) => setAvatar(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select an avatar" />
                            </SelectTrigger>
                            <SelectContent>
                                {avatars.map(({ value, label, icon: Icon }) => (
                                    <SelectItem key={value} value={value}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4" />
                                            <span>{label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {location && <>
                        <div className="font-semibold">Latitude:</div><div>{location.lat.toFixed(4)}</div>
                        <div className="font-semibold">Longitude:</div><div>{location.lon.toFixed(4)}</div>
                    </>}
                    {climateData && <>
                        <div className="font-semibold">Temperature:</div><div>{climateData.temperature}°F</div>
                        <div className="font-semibold">Air Quality (AQI):</div><div>{climateData.aqi}</div>
                        <div className="font-semibold">UV Index:</div><div>{climateData.uvIndex}</div>
                    </>}
                </CardContent>
            </Card>
        )}
      </div>

      <div className="space-y-6">
        {!isTracking ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Awaiting Your Location</h3>
                <p className="text-muted-foreground">Start tracking to receive personalized environmental suggestions.</p>
            </Card>
        ) : isLoading ? (
             <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-semibold">Analyzing Your Surroundings...</h3>
                <p className="text-muted-foreground">Fetching real-time climate data for your location.</p>
            </Card>
        ) : risks.length > 0 ? (
            <SuggestionCard risks={risks} />
        ) : (
            <Card className="flex flex-col items-center justify-center p-8 text-center h-full">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Major Risks Detected</h3>
                <p className="text-muted-foreground">Your current environment appears to be low-risk. Enjoy!</p>
            </Card>
        )}
      </div>
    </div>
  );
}

    