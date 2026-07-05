import { useEffect, useState } from 'react';
import getStorage from '@/utils/localStore';
import { getArea } from '@/stores';

const useArea = () => {
  const [area, setAreaState] = useState(getArea());

  useEffect(() => {
    const listener = getStorage().addOnValueChangedListener((key) => {
      if (key === 'area') setAreaState(getArea());
    });
    return () => listener.remove();
  }, []);

  return area;
};

export default useArea;
