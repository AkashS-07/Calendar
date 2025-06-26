"use client"
import type { Event, EventFormData } from "@/types/event"
import { isWithinInterval, parseISO } from "date-fns"

export function useEventConflicts(events: Event[]) {
  const checkConflicts = (newEvent: EventFormData | Event, excludeId?: string) => {
    const newStart = parseISO(newEvent.startTime)
    const newEnd = parseISO(newEvent.endTime)

    return events.filter((event) => {
      if (excludeId && event.id === excludeId) return false

      const eventStart = parseISO(event.startTime)
      const eventEnd = parseISO(event.endTime)

      // Check if events overlap
      return (
        isWithinInterval(newStart, { start: eventStart, end: eventEnd }) ||
        isWithinInterval(newEnd, { start: eventStart, end: eventEnd }) ||
        isWithinInterval(eventStart, { start: newStart, end: newEnd }) ||
        isWithinInterval(eventEnd, { start: newStart, end: newEnd })
      )
    })
  }

  const getConflictingEvents = () => {
    const conflicts: Event[] = []

    events.forEach((event, index) => {
      const eventConflicts = events.slice(index + 1).filter((otherEvent) => {
        const eventStart = parseISO(event.startTime)
        const eventEnd = parseISO(event.endTime)
        const otherStart = parseISO(otherEvent.startTime)
        const otherEnd = parseISO(otherEvent.endTime)

        return (
          isWithinInterval(eventStart, { start: otherStart, end: otherEnd }) ||
          isWithinInterval(eventEnd, { start: otherStart, end: otherEnd }) ||
          isWithinInterval(otherStart, { start: eventStart, end: eventEnd }) ||
          isWithinInterval(otherEnd, { start: eventStart, end: eventEnd })
        )
      })

      if (eventConflicts.length > 0) {
        conflicts.push(event, ...eventConflicts)
      }
    })

    return Array.from(new Set(conflicts))
  }

  return {
    checkConflicts,
    getConflictingEvents,
  }
}
