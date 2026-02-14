"use client";

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const DarkModeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      className="bg-muted rounded-full p-2"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  )
}

export default DarkModeToggle