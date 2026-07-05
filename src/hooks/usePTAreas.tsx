import { useEffect, useState } from 'react';
import { fetchAreas, Area } from '@/services/prayerTimes';

function usePTAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const fetch = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const fetched = await fetchAreas();
      if (fetched.length === 0) {
        setError(true);
      } else {
        setAreas(fetched);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { areas, isLoading, error, retry: fetch };
}

export default usePTAreas;
