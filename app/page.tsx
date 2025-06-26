"use client"

import { EventCalendar } from "@/components/event-calendar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Event Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Manage your schedule with drag-and-drop, recurring events, and more
          </p>
        </div>
        <EventCalendar />
      </div>
    </div>
  )
}
