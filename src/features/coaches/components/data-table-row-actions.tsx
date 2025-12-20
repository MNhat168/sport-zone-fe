import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type CoachRegistrationRequest } from '../data/schema'
import { useCoaches } from './coaches-provider'
import { useNavigate } from '@tanstack/react-router'

type DataTableRowActionsProps = {
    row: Row<CoachRegistrationRequest>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
    const { setOpen, setCurrentRow } = useCoaches()
    const navigate = useNavigate()

    const handleView = () => {
        navigate({
            to: '/coaches/requests/$id',
            params: { id: row.original.id },
        } as any)
    }

    const handleApprove = () => {
        setCurrentRow(row.original)
        setOpen('approve')
    }

    const handleReject = () => {
        setCurrentRow(row.original)
        setOpen('reject')
    }

    const status = row.original.status

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                    <DotsHorizontalIcon className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[160px]'>
                <DropdownMenuItem onClick={handleView}>
                    View Details
                    <DropdownMenuShortcut>
                        <Eye size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                {status === 'pending' && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleApprove} className='text-green-600'>
                            Approve
                            <DropdownMenuShortcut>
                                <CheckCircle size={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleReject} className='text-red-600'>
                            Reject
                            <DropdownMenuShortcut>
                                <XCircle size={16} />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
