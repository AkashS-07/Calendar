"use client"

import { useState, useCallback } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDay } from "./calendar-day"
import { EventDialog } from "./event-dialog"
import { EventDetailsDialog } from "./event-details-dialog"
import { useEventStorage } from "@/hooks/use-event-storage"
import { useEventConflicts } from "@/hooks/use-event-conflicts"
import { generateRecurringEvents } from "@/lib/recurring-events"
import type { Event, EventFormData } from "@/types/event"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { SearchWithSuggestions } from "./search-with-suggestions"

export function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const { events, addEvent, updateEvent, deleteEvent } = useEventStorage()
  const { checkConflicts, getConflictingEvents } = useEventConflicts(events)

  // Generate all events including recurring ones
  const allEvents = generateRecurringEvents(events, currentDate)

  // Filter events based on search and category
  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch =
      searchTerm === "" ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === null || event.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories for filtering
  const categories = Array.from(
    new Set(events.map((event) => event.category).filter((cat): cat is string => Boolean(cat))),
  )

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedEvent(null)
    setIsEventDialogOpen(true)
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsDetailsDialogOpen(true)
  }

  const handleEventEdit = (event: Event) => {
    setSelectedEvent(event)
    setSelectedDate(new Date(event.startTime))
    setIsDetailsDialogOpen(false)
    setIsEventDialogOpen(true)
  }

  const handleEventSave = (eventData: EventFormData) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, eventData)
    } else {
      const conflicts = checkConflicts(eventData)
      if (conflicts.length > 0) {
        const confirmSave = window.confirm(
          `This event conflicts with ${conflicts.length} existing event(s). Do you want to save it anyway?`,
        )
        if (!confirmSave) return
      }
      addEvent(eventData)
    }
    setIsEventDialogOpen(false)
    setSelectedEvent(null)
    setSelectedDate(null)
  }

  const handleEventDelete = (eventId: string) => {
    deleteEvent(eventId)
    setIsDetailsDialogOpen(false)
    setSelectedEvent(null)
  }

  const handleEventMove = useCallback(
    (eventId: string, newDate: Date) => {
      const event = events.find((e) => e.id === eventId)
      if (!event) return

      const eventDuration = new Date(event.endTime).getTime() - new Date(event.startTime).getTime()
      const newStartTime = new Date(newDate)
      newStartTime.setHours(new Date(event.startTime).getHours())
      newStartTime.setMinutes(new Date(event.startTime).getMinutes())

      const newEndTime = new Date(newStartTime.getTime() + eventDuration)

      const updatedEvent = {
        ...event,
        startTime: newStartTime.toISOString(),
        endTime: newEndTime.toISOString(),
      }

      const conflicts = checkConflicts(updatedEvent, eventId)
      if (conflicts.length > 0) {
        const confirmMove = window.confirm(
          `Moving this event will create conflicts with ${conflicts.length} existing event(s). Continue?`,
        )
        if (!confirmMove) return
      }

      updateEvent(eventId, updatedEvent)
    },
    [events, updateEvent, checkConflicts],
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header with navigation and controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-2xl font-semibold min-w-[200px] text-center">{format(currentDate, "MMMM yyyy")}</h2>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={() => {
                setSelectedDate(new Date())
                setSelectedEvent(null)
                setIsEventDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2 w-full sm:w-auto">
            <SearchWithSuggestions
              events={allEvents}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onEventSelect={handleEventClick}
              onDateNavigate={setCurrentDate}
            />
            {categories.length > 0 && (
              <div className="flex gap-1">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border rounded-lg overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-3 text-center font-medium text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayEvents = filteredEvents.filter((event) => isSameDay(new Date(event.startTime), day))

              return (
                <CalendarDay
                  key={day.toISOString()}
                  date={day}
                  events={dayEvents}
                  isCurrentMonth={isSameMonth(day, currentDate)}
                  isToday={isToday(day)}
                  onDayClick={handleDayClick}
                  onEventClick={handleEventClick}
                  onEventMove={handleEventMove}
                />
              )
            })}
          </div>
        </div>

        {/* Event Statistics */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total Events: {filteredEvents.length}</span>
          {searchTerm && (
            <span>
              Filtered: {filteredEvents.length} of {allEvents.length}
            </span>
          )}
          {getConflictingEvents().length > 0 && (
            <Badge variant="destructive">{getConflictingEvents().length} Conflicts</Badge>
          )}
        </div>

        {/* Event Dialog */}
        <EventDialog
          open={isEventDialogOpen}
          onOpenChange={setIsEventDialogOpen}
          onSave={handleEventSave}
          initialDate={selectedDate}
          initialEvent={selectedEvent}
        />

        {/* Event Details Dialog */}
        <EventDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          event={selectedEvent}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
        />
      </div>
    </DndProvider>
  )
}
