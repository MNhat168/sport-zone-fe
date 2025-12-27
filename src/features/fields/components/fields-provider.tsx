import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Field } from '../data/schema'

type FieldsDialogType = 'view' | 'verify'

type FieldsContextType = {
    open: FieldsDialogType | null
    setOpen: (str: FieldsDialogType | null) => void
    currentRow: Field | null
    setCurrentRow: React.Dispatch<React.SetStateAction<Field | null>>
}

const FieldsContext = React.createContext<FieldsContextType | null>(null)

export function FieldsProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useDialogState<FieldsDialogType>(null)
    const [currentRow, setCurrentRow] = useState<Field | null>(null)

    return (
        <FieldsContext.Provider
            value={{ open, setOpen, currentRow, setCurrentRow }}
        >
            {children}
        </FieldsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFields = () => {
    const fieldsContext = React.useContext(FieldsContext)

    if (!fieldsContext) {
        throw new Error('useFields has to be used within <FieldsProvider>')
    }

    return fieldsContext
}
