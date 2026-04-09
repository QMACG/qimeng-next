import { Tags, Building2, FileText } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, RefAttributes } from 'react'

interface HomeNavItem {
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
  label: string
  href: string
  color: 'primary' | 'secondary' | 'success'
  isExternal: boolean
}

export const homeNavigationItems: HomeNavItem[] = [
  {
    icon: Tags,
    label: '标签',
    href: '/tag',
    color: 'primary',
    isExternal: false
  },
  {
    icon: Building2,
    label: '会社',
    href: '/company',
    color: 'secondary',
    isExternal: false
  },
  {
    icon: FileText,
    label: '文档',
    href: '/doc',
    color: 'success',
    isExternal: false
  }
]
