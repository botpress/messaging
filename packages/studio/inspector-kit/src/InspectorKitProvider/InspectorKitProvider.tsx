import React, { createContext } from 'react'

export const InspectorKitContext = createContext({})

export function InspectorKitProvider({ children }: { children: React.ReactNode }) {
  return <InspectorKitContext.Provider value={{}}>{children}</InspectorKitContext.Provider>
}
