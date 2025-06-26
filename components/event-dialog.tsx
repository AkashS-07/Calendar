"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Event, EventFormData, RecurrenceType } from "@/types/event"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (event: EventFormData) => void
  initialDate?: Date | null
  initialEvent?: Event | null
}

export function EventDialog({ open, onOpenChange, onSave, initialDate, initialEvent }: EventDialogProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "",
    recurrence: {
      type: "none",
      interval: 1,
      daysOfWeek: [],
      endDate: "",
    },
  })

  useEffect(() => {
    if (initialEvent) {
      setFormData({
        title: initialEvent.title,
        description: initialEvent.description,
        startTime: initialEvent.startTime,
        endTime: initialEvent.endTime,
        category: initialEvent.category || "",
        recurrence: initialEvent.recurrence || {
          type: "none",
          interval: 1,
          daysOfWeek: [],
          endDate: "",
        },
      })
    } else if (initialDate) {
      const startTime = new Date(initialDate)
      startTime.setHours(9, 0, 0, 0)
      const endTime = new Date(startTime)
      endTime.setHours(10, 0, 0, 0)

      setFormData({
        title: "",
        description: "",
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        category: "",
        recurrence: {
          type: "none",
          interval: 1,
          daysOfWeek: [],
          endDate: "",
        },
      })
    }
  }, [initialEvent, initialDate, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.startTime || !formData.endTime) return

    onSave(formData)
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      category: "",
      recurrence: {
        type: "none",
        interval: 1,
        daysOfWeek: [],
        endDate: "",
      },
    })
  }

  const handleRecurrenceChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: value,
      },
    }))
  }

  const handleDayOfWeekToggle = (day: number) => {
    const currentDays = formData.recurrence.daysOfWeek || []
    const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day].sort()

    handleRecurrenceChange("daysOfWeek", newDays)
  }

  const daysOfWeek = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          {/* Recurrence Settings */}
          <div className="space-y-3">
            <Label>Recurrence</Label>
            <Select
              value={formData.recurrence.type}
              onValueChange={(value: RecurrenceType) => handleRecurrenceChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {formData.recurrence.type !== "none" && (
              <>
                {formData.recurrence.type === "custom" && (
                  <div>
                    <Label>Repeat every</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={formData.recurrence.interval}
                        onChange={(e) => handleRecurrenceChange("interval", Number.parseInt(e.target.value))}
                        className="w-20"
                      />
                      <Select
                        value={formData.recurrence.customUnit || "days"}
                        onValueChange={(value) => handleRecurrenceChange("customUnit", value)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="days">days</SelectItem>
                          <SelectItem value="weeks">weeks</SelectItem>
                          <SelectItem value="months">months</SelectItem>
                          <SelectItem value="years">years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {formData.recurrence.type === "weekly" && (
                  <div>
                    <Label>Repeat on</Label>
                    <div className="flex gap-1 mt-2">
                      {daysOfWeek.map((day) => (
                        <div key={day.value} className="flex items-center space-x-1">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={formData.recurrence.daysOfWeek?.includes(day.value)}
                            onCheckedChange={() => handleDayOfWeekToggle(day.value)}
                          />
                          <Label htmlFor={`day-${day.value}`} className="text-xs">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.recurrence.endDate}
                    onChange={(e) => handleRecurrenceChange("endDate", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {initialEvent ? "Update Event" : "Add Event"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
