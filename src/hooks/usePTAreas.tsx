import { useEffect, useRef, useState } from 'react';
import PTApi from '@/utils/PTApi';

function usePTAreas() {
  const api = useRef(new PTApi());
  const [areas, setAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAreas = async () => {
    setIsLoading(true);
    const fetchedAreas = await api.current.fetchAreas();
    setAreas(fetchedAreas);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  return { areas, isLoading };
}

export default usePTAreas;
