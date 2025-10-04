import { useEffect, useRef } from 'react'
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar'

type NavigationProgressProps = {
  isLoading?: boolean
}

export function NavigationProgress({ isLoading = false }: NavigationProgressProps) {
  const ref = useRef<LoadingBarRef>(null)

  useEffect(() => {
    if (isLoading) {
      ref.current?.continuousStart()
    } else {
      ref.current?.complete()
    }
  }, [isLoading])

  return (
    <LoadingBar
      color='var(--muted-foreground)'
      ref={ref}
      shadow={true}
      height={2}
    />
  )
}
