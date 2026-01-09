import { useEffect, useState } from 'react'

/**
 * Custom hook per il debouncing di un valore
 * 
 * @param value - Il valore da debounciare (es. searchQuery)
 * @param delay - Il ritardo in millisecondi (default: 500ms)
 * @returns Il valore debounciato che si aggiorna solo dopo il delay
 * 
 * @example
 * const [searchQuery, setSearchQuery] = useState('')
 * const debouncedSearch = useDebounce(searchQuery, 300)
 * 
 * // Ora usa debouncedSearch nelle query invece di searchQuery
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Imposta un timer per aggiornare il valore dopo il delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: cancella il timer se il valore cambia prima del delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

