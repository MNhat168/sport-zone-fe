import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type FieldOwnerRequest, type FieldOwnerProfile } from '../data/schema'

type FieldOwnersDialogType = 'view' | 'approve' | 'reject' | 'verify-bank'

type FieldOwnersContextType = {
  open: FieldOwnersDialogType | null
  setOpen: (str: FieldOwnersDialogType | null) => void
  currentRow: FieldOwnerRequest | FieldOwnerProfile | null
  setCurrentRow: React.Dispatch<
    React.SetStateAction<FieldOwnerRequest | FieldOwnerProfile | null>
  >
}

const FieldOwnersContext = React.createContext<FieldOwnersContextType | null>(
  null
)

export function FieldOwnersProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<FieldOwnersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<
    FieldOwnerRequest | FieldOwnerProfile | null
  >(null)

  return (
    <FieldOwnersContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </FieldOwnersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFieldOwners = () => {
  const fieldOwnersContext = React.useContext(FieldOwnersContext)

  if (!fieldOwnersContext) {
    throw new Error(
      'useFieldOwners has to be used within <FieldOwnersProvider>'
    )
  }

  return fieldOwnersContext
}

