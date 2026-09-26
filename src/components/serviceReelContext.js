import { createContext, useContext, useEffect, useState } from 'react';

export const ServiceReelContext = createContext(null);

export const useServiceReel = () => useContext(ServiceReelContext);

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [query]);

  return matches;
};
