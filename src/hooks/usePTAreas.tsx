import { useEffect, useRef, useState } from 'react';
import PTApi from '@/utils/PTApi';

function usePTAreas() {
  const api = useRef(new PTApi());
  const [areas, setAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const fetchAreas = async () => {
    setIsLoading(true);
    setError(false);
    try {
      const fetchedAreas = await api.current.fetchAreas();
      if (!fetchedAreas || fetchedAreas.length === 0) {
        setError(true);
      } else {
        setAreas(fetchedAreas);
      }
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  return { areas, isLoading, error, retry: fetchAreas };
}

export default usePTAreas;
