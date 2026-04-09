import { cn } from '~/utils/cn'

interface Props {
  user?: Pick<KunUser, 'name' | 'role'> | null
  name?: string
  role?: number
  className?: string
}

const getRoleClassName = (role?: number) => {
  switch (role) {
    case 2:
      return 'text-[color:var(--user-role-2-color)]'
    case 3:
      return 'text-[color:var(--user-role-3-color)]'
    case 4:
      return 'text-[color:var(--user-role-4-color)]'
    default:
      return 'text-[color:var(--user-role-1-color)]'
  }
}

export const UserName = ({ user, name, role, className }: Props) => {
  const displayName = user?.name ?? name ?? ''
  const displayRole = user?.role ?? role

  return (
    <span className={cn(getRoleClassName(displayRole), className)}>
      {displayName}
    </span>
  )
}
