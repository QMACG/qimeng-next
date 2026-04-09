import { z } from 'zod'
import { prisma } from '~/prisma/index'
import { adminUpdateUserSchema } from '~/validations/admin'
import { deleteKunToken } from '~/app/api/utils/jwt'
import { hashPassword } from '~/app/api/utils/algorithm'

export const updateUser = async (
  input: z.infer<typeof adminUpdateUserSchema>,
  adminUid: number
) => {
  const { uid, dailyImageCount, password, ...rest } = input

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: {
      id: true,
      daily_image_count: true,
      name: true,
      email: true,
      bio: true,
      role: true,
      status: true
    }
  })
  if (!user) {
    return '未找到该用户'
  }

  const admin = await prisma.user.findUnique({
    where: { id: adminUid },
    select: {
      id: true,
      name: true,
      role: true
    }
  })
  if (!admin) {
    return '未找到当前管理员'
  }

  const isTargetPrivileged = user.role >= 3
  const isPromotingToPrivileged = rest.role >= 3
  const isSuperAdmin = admin.role >= 4

  if (!isSuperAdmin && isTargetPrivileged) {
    return '只有超级管理员可以修改管理员账号'
  }
  if (!isSuperAdmin && isPromotingToPrivileged) {
    return '只有超级管理员可以授予管理员或超级管理员权限'
  }

  if (rest.name !== user.name) {
    const existingUserByName = await prisma.user.findUnique({
      where: { name: rest.name },
      select: { id: true }
    })
    if (existingUserByName) {
      return '该用户名已被其他用户使用'
    }
  }

  if (rest.email !== user.email) {
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: rest.email },
      select: { id: true }
    })
    if (existingUserByEmail) {
      return '该邮箱已被其他用户使用'
    }
  }

  if (user.role === 4 && rest.role !== 4) {
    const superAdminCount = await prisma.user.count({
      where: { role: 4 }
    })
    if (superAdminCount <= 1) {
      return '至少保留一个超级管理员账号'
    }
  }

  const hashedPassword = password ? await hashPassword(password) : undefined
  const logInput = {
    ...input,
    ...(password ? { password: '[REDACTED]' } : {})
  }

  await deleteKunToken(uid)

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: uid },
      data: {
        daily_image_count: dailyImageCount,
        ...rest,
        ...(hashedPassword ? { password: hashedPassword } : {})
      }
    })

    await tx.admin_log.create({
      data: {
        type: 'update',
        user_id: adminUid,
        content: `管理员 ${admin.name} 更新了用户资料\n\n更新内容:\n${JSON.stringify(logInput)}\n\n原始数据:\n${JSON.stringify(user)}`
      }
    })

    return {}
  })
}
