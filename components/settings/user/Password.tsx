'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@heroui/button'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'
import { Input } from '@heroui/input'
import { Link } from '@heroui/link'
import toast from 'react-hot-toast'
import { passwordSchema } from '~/validations/user'
import { kunFetchPost } from '~/utils/kunFetch'
import { kunErrorHandler } from '~/utils/kunErrorHandler'

type PasswordFormData = z.infer<typeof passwordSchema>

export const Password = () => {
  const [loading, setLoading] = useState(false)

  const {
    control,
    watch,
    formState: { errors },
    reset
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: ''
    }
  })

  const handleUpdatePassword = async () => {
    setLoading(true)

    const res = await kunFetchPost<KunResponse<{}>>(
      '/user/setting/password',
      watch()
    )
    kunErrorHandler(res, () => {
      reset()
      toast.success('密码修改成功')
    })

    setLoading(false)
  }

  return (
    <Card className="w-full text-sm">
      <form>
        <CardHeader>
          <h2 className="text-xl font-medium">密码</h2>
        </CardHeader>

        <CardBody className="space-y-4 py-0">
          <div>
            <p>修改密码时，需要先输入当前密码，再设置新的密码。</p>
          </div>

          <Controller
            name="oldPassword"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                label="当前密码"
                autoComplete="current-password"
                isInvalid={!!errors.oldPassword}
                errorMessage={errors.oldPassword?.message}
              />
            )}
          />

          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="password"
                label="新密码"
                autoComplete="new-password"
                isInvalid={!!errors.newPassword}
                errorMessage={errors.newPassword?.message}
              />
            )}
          />
        </CardBody>

        <CardFooter className="flex-wrap">
          <p className="text-default-500">
            密码长度至少 6
            个字符，可包含数字、字母与常见符号，建议不要与其他网站重复。
          </p>
          <Button
            color="primary"
            variant="solid"
            className="ml-auto"
            isLoading={loading}
            onPress={handleUpdatePassword}
          >
            保存
          </Button>
        </CardFooter>

        <Divider />

        <CardFooter>
          <Link showAnchorIcon href="/auth/forgot">
            忘记密码？
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
