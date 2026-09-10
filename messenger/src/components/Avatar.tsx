import { getInitials } from '../lib/utils'
import { cn } from '../lib/utils'

interface Props {
  name: string
  photoURL?: string
  size?: 'sm' | 'md' | 'lg'
  online?: boolean
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function Avatar({ name, photoURL, size = 'md', online, className }: Props) {
  return (
    <div className={cn('relative flex-shrink-0', className)}>
      {photoURL ? (
        <img
          src={photoURL}
          alt={name}
          className={cn('rounded-full object-cover', sizes[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-semibold text-white',
            sizes[size]
          )}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-slate-900',
            size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3',
            online ? 'bg-emerald-400' : 'bg-slate-500'
          )}
        />
      )}
    </div>
  )
}
