import { redirect } from 'next/navigation'

export const revalidate = 3

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserResourcePage({ params }: Props) {
  const { id } = await params
  redirect(`/user/${id}/comment`)
}
