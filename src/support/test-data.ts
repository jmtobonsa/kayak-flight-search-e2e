const SPANISH_MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Format a JS Date as Kayak's Spanish date label: "1 de junio de 2026" */
export function formatSpanishDate(date: Date): string {
  const day = date.getDate();
  const month = SPANISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}

/** Get a future date N days from today */
export function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

/** Abbreviated Spanish month for assertions (e.g., "jun") */
export function shortMonthName(date: Date): string {
  return SPANISH_MONTHS[date.getMonth()].slice(0, 3);
}

export const FLIGHT_SEARCH_DATA = {
  origin: "Medellín",
  destination: "Miami",
  originAirportCode: "MDE",
  destinationAirportCode: "MIA",
  tripType: "Ida y vuelta",
  cabinClass: "Económica",
  adults: 1,
  departureDaysFromNow: 56,
  returnDaysFromNow: 70,
} as const;
