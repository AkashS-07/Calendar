export interface Event {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  category?: string
  recurrence?: Recurrence
  createdAt: string
  updatedAt: string
}

export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom"

export interface Recurrence {
  type: RecurrenceType
  interval: number
  daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, etc.
  endDate?: string
  customUnit?: "days" | "weeks" | "months" | "years"
}

export interface EventFormData {
  title: string
  description: string
  startTime: string
  endTime: string
  category?: string
  recurrence: Recurrence
}
