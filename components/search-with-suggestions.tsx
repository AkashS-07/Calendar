"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { Search, Calendar, Clock, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Event } from "@/types/event"

interface SearchWithSuggestionsProps {
  events: Event[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onEventSelect: (event: Event) => void
  onDateNavigate: (date: Date) => void
}

interface SearchResult {
  event: Event
  matchType: "title" | "description" | "category"
  matchText: string
}

export function SearchWithSuggestions({
  events,
  searchTerm,
  onSearchChange,
  onEventSelect,
  onDateNavigate,
}: SearchWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generate search results
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      setIsOpen(false)
      return
    }

    const results: SearchResult[] = []
    const searchLower = searchTerm.toLowerCase()

    events.forEach((event) => {
      const titleMatch = event.title.toLowerCase().includes(searchLower)
      const descriptionMatch = event.description?.toLowerCase().includes(searchLower)
      const categoryMatch = event.category?.toLowerCase().includes(searchLower)

      if (titleMatch) {
        results.push({
          event,
          matchType: "title",
          matchText: event.title,
        })
      } else if (descriptionMatch) {
        results.push({
          event,
          matchType: "description",
          matchText: event.description || "",
        })
      } else if (categoryMatch) {
        results.push({
          event,
          matchType: "category",
          matchText: event.category || "",
        })
      }
    })

    // Sort by relevance (title matches first, then by date)
    results.sort((a, b) => {
      if (a.matchType === "title" && b.matchType !== "title") return -1
      if (b.matchType === "title" && a.matchType !== "title") return 1
      return new Date(a.event.startTime).getTime() - new Date(b.event.startTime).getTime()
    })

    setSearchResults(results.slice(0, 8)) // Limit to 8 results
    setIsOpen(results.length > 0)
    setSelectedIndex(-1)
  }, [searchTerm, events])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || searchResults.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleResultSelect(searchResults[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    const eventDate = new Date(result.event.startTime)

    // Navigate to the month containing the event
    onDateNavigate(eventDate)

    // Clear search and close dropdown
    onSearchChange("")
    setIsOpen(false)
    setSelectedIndex(-1)

    // Small delay to ensure calendar has updated, then select the event
    setTimeout(() => {
      onEventSelect(result.event)
    }, 100)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Highlight matching text
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text

    const regex = new RegExp(`(${searchTerm})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case "title":
        return <Calendar className="h-3 w-3" />
      case "description":
        return <Clock className="h-3 w-3" />
      case "category":
        return <Badge className="h-3 w-3" />
      default:
        return <Search className="h-3 w-3" />
    }
  }

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case "title":
        return "Title"
      case "description":
        return "Description"
      case "category":
        return "Category"
      default:
        return "Match"
    }
  }

  return (
    <div className="relative flex-1 sm:w-64">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search events... (type to see suggestions)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchResults.length > 0) setIsOpen(true)
          }}
          className="pl-10 pr-4"
          autoComplete="off"
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          <div className="p-2 text-xs text-muted-foreground border-b">
            {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
          </div>

          {searchResults.map((result, index) => (
            <div
              key={`${result.event.id}-${index}`}
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b last:border-b-0",
                "hover:bg-muted/50",
                selectedIndex === index && "bg-muted",
              )}
              onClick={() => handleResultSelect(result)}
            >
              <div className="flex-shrink-0">{getMatchTypeIcon(result.matchType)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{highlightMatch(result.event.title, searchTerm)}</h4>
                  {result.event.category && (
                    <Badge variant="secondary" className="text-xs">
                      {result.event.category}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(result.event.startTime), "MMM d, yyyy")}</span>
                  <span>•</span>
                  <span>{format(new Date(result.event.startTime), "h:mm a")}</span>
                  <span>•</span>
                  <span className="text-xs opacity-75">{getMatchTypeLabel(result.matchType)} match</span>
                </div>

                {result.matchType === "description" && result.event.description && (
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    {highlightMatch(result.event.description.slice(0, 60), searchTerm)}
                    {result.event.description.length > 60 && "..."}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          ))}

          <div className="p-2 text-xs text-muted-foreground text-center border-t bg-muted/20">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      )}
    </div>
  )
}
