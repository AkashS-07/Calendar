import type { Event } from "@/types/event"
import { addDays, addWeeks, addMonths, isBefore, isAfter, startOfMonth, endOfMonth, getDay } from "date-fns"

export function generateRecurringEvents(events: Event[], currentDate: Date): Event[] {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const allEvents: Event[] = []

  events.forEach((event) => {
    // Add the original event
    allEvents.push(event)

    // Generate recurring instances if applicable
    if (event.recurrence && event.recurrence.type !== "none") {
      const recurringEvents = generateRecurrenceInstances(event, monthStart, monthEnd)
      allEvents.push(...recurringEvents)
    }
  })

  return allEvents
}

function generateRecurrenceInstances(event: Event, rangeStart: Date, rangeEnd: Date): Event[] {
  const instances: Event[] = []
  const originalStart = new Date(event.startTime)
  const originalEnd = new Date(event.endTime)
  const duration = originalEnd.getTime() - originalStart.getTime()

  if (!event.recurrence) return instances

  let currentDate = new Date(originalStart)
  const endDate = event.recurrence.endDate
    ? new Date(event.recurrence.endDate)
    : new Date(rangeEnd.getTime() + 365 * 24 * 60 * 60 * 1000) // 1 year from range end

  // Generate instances up to 100 to prevent infinite loops
  let instanceCount = 0
  const maxInstances = 100

  while (isBefore(currentDate, endDate) && instanceCount < maxInstances) {
    let nextDate: Date

    switch (event.recurrence.type) {
      case "daily":
        nextDate = addDays(currentDate, 1)
        break
      case "weekly":
        if (event.recurrence.daysOfWeek && event.recurrence.daysOfWeek.length > 0) {
          nextDate = getNextWeeklyOccurrence(currentDate, event.recurrence.daysOfWeek)
        } else {
          nextDate = addWeeks(currentDate, 1)
        }
        break
      case "monthly":
        nextDate = addMonths(currentDate, 1)
        break
      case "yearly":
        nextDate = addMonths(currentDate, 12)
        break
      case "custom":
        const unit = event.recurrence.customUnit || "days"
        const interval = event.recurrence.interval
        switch (unit) {
          case "days":
            nextDate = addDays(currentDate, interval)
            break
          case "weeks":
            nextDate = addWeeks(currentDate, interval)
            break
          case "months":
            nextDate = addMonths(currentDate, interval)
            break
          case "years":
            nextDate = addMonths(currentDate, interval * 12)
            break
          default:
            nextDate = addDays(currentDate, interval)
        }
        break
      default:
        return instances
    }

    // Only add instances that fall within our range
    if (isAfter(nextDate, rangeStart) && isBefore(nextDate, rangeEnd)) {
      const instanceEnd = new Date(nextDate.getTime() + duration)

      instances.push({
        ...event,
        id: `${event.id}-${nextDate.toISOString()}`,
        startTime: nextDate.toISOString(),
        endTime: instanceEnd.toISOString(),
      })
    }

    currentDate = nextDate
    instanceCount++

    // Break if we've moved too far past our range
    if (isAfter(currentDate, new Date(rangeEnd.getTime() + 365 * 24 * 60 * 60 * 1000))) {
      break
    }
  }

  return instances
}

function getNextWeeklyOccurrence(currentDate: Date, daysOfWeek: number[]): Date {
  const currentDay = getDay(currentDate)
  const sortedDays = [...daysOfWeek].sort()

  // Find next occurrence in the same week
  const nextDayInWeek = sortedDays.find((day) => day > currentDay)

  if (nextDayInWeek !== undefined) {
    const daysToAdd = nextDayInWeek - currentDay
    return addDays(currentDate, daysToAdd)
  } else {
    // Move to next week and use first day
    const daysToNextWeek = 7 - currentDay + sortedDays[0]
    return addDays(currentDate, daysToNextWeek)
  }
}
