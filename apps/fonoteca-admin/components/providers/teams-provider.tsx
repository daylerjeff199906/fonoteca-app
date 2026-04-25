'use client'

import React, { createContext, useContext } from 'react'

interface Team {
  name: string
  logo: string
  plan: string
  url: string
}

interface TeamsContextType {
  teams: Team[]
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined)

export function TeamsProvider({ children, teams }: { children: React.ReactNode, teams: Team[] }) {
  return (
    <TeamsContext.Provider value={{ teams }}>
      {children}
    </TeamsContext.Provider>
  )
}

export function useTeams() {
  const context = useContext(TeamsContext)
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider')
  }
  return context
}
