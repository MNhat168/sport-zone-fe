import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type CoachRegistrationRequest } from '../data/schema'

type CoachesDialogType = 'view' | 'approve' | 'reject'

type CoachesContextType = {
    open: CoachesDialogType | null
    setOpen: (str: CoachesDialogType | null) => void
    currentRow: CoachRegistrationRequest | null
    setCurrentRow: React.Dispatch<
        React.SetStateAction<CoachRegistrationRequest | null>
    >
}

const CoachesContext = React.createContext<CoachesContextType | null>(
    null
)

export function CoachesProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [open, setOpen] = useDialogState<CoachesDialogType>(null)
    const [currentRow, setCurrentRow] = useState<
        CoachRegistrationRequest | null
    >(null)

    return (
        <CoachesContext.Provider
            value={{ open, setOpen, currentRow, setCurrentRow }}
        >
            {children}
        </CoachesContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCoaches = () => {
    const coachesContext = React.useContext(CoachesContext)

    if (!coachesContext) {
        throw new Error(
            'useCoaches has to be used within <CoachesProvider>'
        )
    }

    return coachesContext
}
