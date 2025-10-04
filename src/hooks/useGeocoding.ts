import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

export const useGeocoding = () => {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchAddress = async (address: string): Promise<GeocodingResult[]> => {
    if (!address || address.trim().length < 5) {
      return [];
    }

    setIsSearching(true);
    try {
      // Usar Nominatim API (OpenStreetMap) - gratuito
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(address)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=5&` +
        `countrycodes=br`, // Limitar ao Brasil
        {
          headers: {
            'Accept-Language': 'pt-BR',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar endereço');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Geocoding error:', error);
      toast({
        title: 'Erro ao buscar endereço',
        description: 'Não foi possível validar o endereço. Tente novamente.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number } | null> => {
    const results = await searchAddress(address);
    
    if (results.length === 0) {
      toast({
        title: 'Endereço não encontrado',
        description: 'Verifique se o endereço está correto e completo.',
        variant: 'destructive',
      });
      return null;
    }

    const result = results[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    };
  };

  return {
    searchAddress,
    geocodeAddress,
    isSearching,
  };
};
