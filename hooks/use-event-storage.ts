"use client"

import { useState, useEffect } from "react"
import type { Event, EventFormData } from "@/types/event"

const STORAGE_KEY = "event-calendar-events"

export function useEventStorage() {
  const [events, setEvents] = useState<Event[]>([])

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setEvents(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load events from storage:", error)
    }
  }, [])

  // Save events to localStorage whenever events change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
    } catch (error) {
      console.error("Failed to save events to storage:", error)
    }
  }, [events])

  const addEvent = (eventData: EventFormData) => {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      title: eventData.title,
      description: eventData.description,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      category: eventData.category || undefined,
      recurrence: eventData.recurrence.type === "none" ? undefined : eventData.recurrence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setEvents((prev) => [...prev, newEvent])
  }

  const updateEvent = (id: string, eventData: Partial<EventFormData>) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...eventData, updatedAt: new Date().toISOString() } : event)),
    )
  }

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id))
  }

  const getEvent = (id: string) => {
    return events.find((event) => event.id === id)
  }

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEvent,
  }
}
