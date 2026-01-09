import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatta una data in formato italiano (gg/mm/aaaa)
 * @param date - La data da formattare (string, Date, o null/undefined)
 * @returns La data formattata o "-" se la data non è valida
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-"
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    
    // Verifica che sia una data valida
    if (isNaN(dateObj.getTime())) return "-"
    
    // Formatta in italiano (gg/mm/aaaa)
    const day = dateObj.getDate().toString().padStart(2, "0")
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0")
    const year = dateObj.getFullYear()
    
    return `${day}/${month}/${year}`
  } catch (error) {
    console.error("Errore nella formattazione della data:", error)
    return "-"
  }
}
