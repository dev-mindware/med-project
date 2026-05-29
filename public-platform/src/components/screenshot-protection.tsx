"use client"

import { useEffect } from "react"

export function ScreenshotProtection() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common screenshot shortcuts
      if (
        (e.ctrlKey && e.shiftKey && e.key === "S") || // Chrome screenshot
        (e.metaKey && e.shiftKey && e.key === "3") || // Mac screenshot
        (e.metaKey && e.shiftKey && e.key === "4") || // Mac area screenshot
        e.key === "PrintScreen" // Print screen
      ) {
        e.preventDefault()
        console.log("[v0] Screenshot attempt detected and prevented")
        return false
      }
    }

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Add blur effect when window loses focus (potential screenshot)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = "blur(5px)"
      } else {
        document.body.style.filter = "none"
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return null
}
