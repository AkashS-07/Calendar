"use client"

import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Event } from "@/types/event"
import { EventItem } from "./event-item"
import { useDrop } from "react-dnd"

interface CalendarDayProps {
  date: Date
  events: Event[]
  isCurrentMonth: boolean
  isToday: boolean
  onDayClick: (date: Date) => void
  onEventClick: (event: Event) => void
  onEventMove: (eventId: string, newDate: Date) => void
}

export function CalendarDay({
  date,
  events,
  isCurrentMonth,
  isToday,
  onDayClick,
  onEventClick,
  onEventMove,
}: CalendarDayProps) {
  const [{ isOver }, drop] = useDrop({
    accept: "event",
    drop: (item: { eventId: string }) => {
      onEventMove(item.eventId, date)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const dayNumber = format(date, "d")
  const maxVisibleEvents = 3

  return (
    <div
      ref={drop}
      className={cn(
        "min-h-[120px] border-r border-b p-2 cursor-pointer transition-colors",
        "hover:bg-muted/50",
        !isCurrentMonth && "text-muted-foreground bg-muted/20",
        isToday && "bg-primary/10 border-primary/20",
        isOver && "bg-primary/20",
      )}
      onClick={() => onDayClick(date)}
    >
      <div className="flex justify-between items-start mb-1">
        <span
          className={cn(
            "text-sm font-medium",
            isToday &&
              "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs",
          )}
        >
          {dayNumber}
        </span>
      </div>

      <div className="space-y-1">
        {events.slice(0, maxVisibleEvents).map((event) => (
          <EventItem
            key={event.id}
            event={event}
            onClick={(e) => {
              e.stopPropagation()
              onEventClick(event)
            }}
          />
        ))}

        {events.length > maxVisibleEvents && (
          <div className="text-xs text-muted-foreground px-1">+{events.length - maxVisibleEvents} more</div>
        )}
      </div>
    </div>
  )
}
