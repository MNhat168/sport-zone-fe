import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type WithdrawalRequest } from '../data/schema'

type WithdrawalsDialogType = 'approve' | 'reject'

type WithdrawalsContextType = {
  open: WithdrawalsDialogType | null
  setOpen: (str: WithdrawalsDialogType | null) => void
  currentRow: WithdrawalRequest | null
  setCurrentRow: React.Dispatch<React.SetStateAction<WithdrawalRequest | null>>
}

const WithdrawalsContext = React.createContext<WithdrawalsContextType | null>(null)

export function WithdrawalsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<WithdrawalsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<WithdrawalRequest | null>(null)

  return (
    <WithdrawalsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </WithdrawalsContext.Provider>
  )
}

export const useWithdrawals = () => {
  const withdrawalsContext = React.useContext(WithdrawalsContext)

  if (!withdrawalsContext) {
    throw new Error('useWithdrawals has to be used within <WithdrawalsProvider>')
  }

  return withdrawalsContext
}
