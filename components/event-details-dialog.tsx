"use client"

import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/types/event"
import { Edit, Trash2, Repeat, Clock } from "lucide-react"

interface EventDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
}

export function EventDetailsDialog({ open, onOpenChange, event, onEdit, onDelete }: EventDetailsDialogProps) {
  if (!event) return null

  const handleDelete = () => {
    const confirmed = window.confirm("Are you sure you want to delete this event?")
    if (confirmed) {
      onDelete(event.id)
    }
  }

  const getRecurrenceText = () => {
    if (!event.recurrence || event.recurrence.type === "none") return null

    switch (event.recurrence.type) {
      case "daily":
        return "Repeats daily"
      case "weekly":
        if (event.recurrence.daysOfWeek && event.recurrence.daysOfWeek.length > 0) {
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          const selectedDays = event.recurrence.daysOfWeek.map((d) => days[d]).join(", ")
          return `Repeats weekly on ${selectedDays}`
        }
        return "Repeats weekly"
      case "monthly":
        return "Repeats monthly"
      case "yearly":
        return "Repeats yearly"
      case "custom":
        const unit = event.recurrence.customUnit || "days"
        return `Repeats every ${event.recurrence.interval} ${unit}`
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {event.title}
            {event.category && (
              <Badge variant="secondary" className="capitalize">
                {event.category}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(event.startTime), "PPP")} at {format(new Date(event.startTime), "p")} -{" "}
              {format(new Date(event.endTime), "p")}
            </span>
          </div>

          {getRecurrenceText() && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Repeat className="h-4 w-4" />
              <span>{getRecurrenceText()}</span>
              {event.recurrence?.endDate && <span>until {format(new Date(event.recurrence.endDate), "PP")}</span>}
            </div>
          )}

          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={() => onEdit(event)} className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
