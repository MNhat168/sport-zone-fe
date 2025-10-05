import { Button } from '@/components/ui/button'

type ForbiddenErrorProps = {
  onNavigate?: (path: string) => void
  onGoBack?: () => void
}

export function ForbiddenError({ onNavigate, onGoBack }: ForbiddenErrorProps) {
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>403</h1>
        <span className='font-medium'>Access Forbidden</span>
        <p className='text-muted-foreground text-center'>
          You don't have necessary permission <br />
          to view this resource.
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={onGoBack}>
            Go Back
          </Button>
          <Button onClick={() => onNavigate?.('/')}>Back to Home</Button>
        </div>
      </div>
    </div>
  )
}
