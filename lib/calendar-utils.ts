// Utilitaires pour la gestion du calendrier

// ============================================
// Navigation temporelle
// ============================================

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  // Lundi = 0, Dimanche = 6 (ajustement pour commencer le lundi)
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// ============================================
// Comparaisons
// ============================================

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isPast(date: Date): boolean {
  const today = startOfDay(new Date());
  return date < today;
}

export function isFuture(date: Date): boolean {
  const today = startOfDay(new Date());
  return date > today;
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
}

// ============================================
// Formatage
// ============================================

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const MONTH_NAMES_SHORT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const DAY_NAMES_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function formatDayTitle(date: Date): string {
  const dayName = DAY_NAMES[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()].toLowerCase();
  const year = date.getFullYear();
  return `${dayName} ${day} ${month} ${year}`;
}

export function formatWeekTitle(date: Date): string {
  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 6);

  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();

  if (isSameMonth(weekStart, weekEnd)) {
    return `${startDay} - ${endDay} ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
  }

  return `${startDay} ${MONTH_NAMES_SHORT[weekStart.getMonth()]} - ${endDay} ${MONTH_NAMES_SHORT[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
}

export function formatMonthTitle(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatTime(time: string): string {
  // Retourne le temps au format HH:mm
  return time.slice(0, 5);
}

export function formatDateShort(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES_SHORT[date.getMonth()]}`;
}

export function getDayName(date: Date, short = false): string {
  return short ? DAY_NAMES_SHORT[date.getDay()] : DAY_NAMES[date.getDay()];
}

// ============================================
// Génération
// ============================================

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isWeekend: boolean;
}

export function getWeekDays(date: Date): WeekDay[] {
  const weekStart = startOfWeek(date);
  const days: WeekDay[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(weekStart, i);
    days.push({
      date: currentDate,
      dayName: DAY_NAMES_SHORT[currentDate.getDay()],
      dayNumber: currentDate.getDate(),
      isToday: isToday(currentDate),
      isWeekend: isWeekend(currentDate),
    });
  }

  return days;
}

export interface MonthDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isPast: boolean;
}

export function getMonthDays(date: Date): MonthDay[] {
  const days: MonthDay[] = [];
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  // Jours du mois précédent pour compléter la première semaine
  const firstDayOfWeek = monthStart.getDay();
  const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  for (let i = daysFromPrevMonth; i > 0; i--) {
    const prevDate = addDays(monthStart, -i);
    days.push({
      date: prevDate,
      dayNumber: prevDate.getDate(),
      isCurrentMonth: false,
      isToday: isToday(prevDate),
      isWeekend: isWeekend(prevDate),
      isPast: isPast(prevDate),
    });
  }

  // Jours du mois courant
  const daysInMonth = monthEnd.getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
    days.push({
      date: currentDate,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: isToday(currentDate),
      isWeekend: isWeekend(currentDate),
      isPast: isPast(currentDate),
    });
  }

  // Jours du mois suivant pour compléter la dernière semaine
  const remainingDays = 42 - days.length; // 6 semaines x 7 jours
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = addDays(monthEnd, i);
    days.push({
      date: nextDate,
      dayNumber: nextDate.getDate(),
      isCurrentMonth: false,
      isToday: isToday(nextDate),
      isWeekend: isWeekend(nextDate),
      isPast: isPast(nextDate),
    });
  }

  return days;
}

export interface TimeSlot {
  hour: number;
  label: string;
}

export function getTimeSlots(startHour = 6, endHour = 22): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push({
      hour,
      label: `${hour.toString().padStart(2, "0")}:00`,
    });
  }

  return slots;
}

// ============================================
// Calcul de date range
// ============================================

export interface DateRange {
  from: Date;
  to: Date;
}

export function getDayRange(date: Date): DateRange {
  return {
    from: startOfDay(date),
    to: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999),
  };
}

export function getWeekRange(date: Date): DateRange {
  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { from: weekStart, to: weekEnd };
}

export function getMonthRange(date: Date): DateRange {
  return {
    from: startOfMonth(date),
    to: endOfMonth(date),
  };
}

// ============================================
// Transformation des données
// ============================================

import type { TransportRequestSummary, RequestStatus, CalendarEvent } from "./types";

export function toCalendarEvent(request: TransportRequestSummary): CalendarEvent {
  return {
    id: request.id,
    trackingId: request.trackingId,
    title: `${request.patientFirstName} ${request.patientLastName}`,
    time: formatTime(request.requestedTime),
    date: new Date(request.requestedDate),
    status: request.status,
    transportType: request.transportType,
    tripType: request.tripType as "ONE_WAY" | "ROUND_TRIP",
    pickupCity: request.pickupCity,
    destinationCity: request.destinationCity,
  };
}

export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>();

  events.forEach(event => {
    const dateKey = event.date.toISOString().split("T")[0];
    const existing = grouped.get(dateKey) || [];
    existing.push(event);
    grouped.set(dateKey, existing);
  });

  // Trier par heure
  grouped.forEach((dayEvents, key) => {
    dayEvents.sort((a, b) => a.time.localeCompare(b.time));
    grouped.set(key, dayEvents);
  });

  return grouped;
}

export function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getStatusPriority(status: RequestStatus): number {
  const priorities: Record<RequestStatus, number> = {
    PENDING: 0,
    COUNTER_PROPOSAL: 1,
    ACCEPTED: 2,
    COMPLETED: 3,
    REFUSED: 4,
    CANCELLED: 5,
  };
  return priorities[status];
}

export function getPredomnantStatus(events: CalendarEvent[]): RequestStatus | null {
  if (events.length === 0) return null;

  // Retourner le statut avec la priorité la plus haute (nombre le plus bas)
  return events.reduce((prev, curr) => {
    return getStatusPriority(curr.status) < getStatusPriority(prev.status) ? curr : prev;
  }).status;
}

// ============================================
// Calcul de position pour timeline
// ============================================

export function getEventTopPosition(time: string, startHour: number): number {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = (hours - startHour) * 60 + minutes;
  return totalMinutes; // 1 minute = 1px (sera ajusté avec un multiplicateur)
}

export function getCurrentTimePosition(startHour: number): number | null {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  if (hours < startHour || hours > 22) return null;

  return (hours - startHour) * 60 + minutes;
}
