import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
     try {
        const item = window.localStorage.getItem(key);
        if (item) {
            setStoredValue(JSON.parse(item));
        } else {
             window.localStorage.setItem(key, JSON.stringify(initialValue));
        }
     } catch(e) {
         console.error(e)
     }
  }, [key, initialValue]);


  return [storedValue, setValue];
}

export default useLocalStorage;
