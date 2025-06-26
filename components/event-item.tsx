"use client"

import type React from "react"

import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Event } from "@/types/event"
import { useDrag } from "react-dnd"
import { Repeat } from "lucide-react"

interface EventItemProps {
  event: Event
  onClick: (e: React.MouseEvent) => void
}

const categoryColors = {
  work: "bg-blue-500",
  personal: "bg-green-500",
  health: "bg-red-500",
  social: "bg-purple-500",
  travel: "bg-orange-500",
  default: "bg-gray-500",
}

export function EventItem({ event, onClick }: EventItemProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "event",
    item: { eventId: event.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const colorClass = categoryColors[event.category as keyof typeof categoryColors] || categoryColors.default

  return (
    <div
      ref={drag}
      className={cn(
        "text-xs p-1 rounded cursor-pointer transition-opacity",
        "hover:opacity-80 text-white",
        colorClass,
        isDragging && "opacity-50",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {event.recurrence && event.recurrence.type !== "none" && <Repeat className="h-3 w-3" />}
        <span className="truncate font-medium">{event.title}</span>
      </div>
      <div className="text-xs opacity-90">{format(new Date(event.startTime), "HH:mm")}</div>
    </div>
  )
}
