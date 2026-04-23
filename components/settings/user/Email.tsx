'use client'

import { useState } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardBody, CardFooter, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { KeyRound, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { EmailVerification } from '~/components/kun/verification-code/Code'
import { resetEmailSchema } from '~/validations/user'
import { kunFetchPost } from '~/utils/kunFetch'
import { kunErrorHandler } from '~/utils/kunErrorHandler'

type EmailFormData = z.infer<typeof resetEmailSchema>

export const Email = () => {
  const [loading, setLoading] = useState(false)

  const {
    control,
    formState: { errors },
    watch,
    reset
  } = useForm<EmailFormData>({
    resolver: zodResolver(resetEmailSchema),
    defaultValues: {
      email: '',
      code: ''
    }
  })

  const handleUpdateEmail = async () => {
    setLoading(true)

    const res = await kunFetchPost<KunResponse<{}>>(
      '/user/setting/email',
      watch()
    )
    kunErrorHandler(res, () => {
      reset()
      toast.success('邮箱更新成功')
    })

    setLoading(false)
  }

  return (
    <Card className="w-full text-sm">
      <form>
        <CardHeader>
          <h2 className="text-xl font-medium">邮箱</h2>
        </CardHeader>

        <CardBody className="space-y-4 py-0">
          <div>
            <p>这里可以修改您的邮箱地址，邮箱将用于密码找回和站内通知。</p>
            <p>
              点击发送验证码后，新邮箱会收到一封包含验证码的邮件，请将收到的验证码填入下方。
            </p>
          </div>

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                placeholder="请输入新的邮箱地址"
                startContent={
                  <Mail className="pointer-events-none shrink-0 text-2xl text-default-400" />
                }
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="输入新邮箱收到的验证码"
                startContent={
                  <KeyRound className="pointer-events-none shrink-0 text-2xl text-default-400" />
                }
                endContent={
                  <EmailVerification
                    username=""
                    email={watch().email}
                    type="email"
                  />
                }
                isInvalid={!!errors.code}
                errorMessage={errors.code?.message}
              />
            )}
          />
        </CardBody>

        <CardFooter className="flex-wrap">
          <p className="text-default-500">
            如果新邮箱暂时没有收到验证码，请检查垃圾邮件箱，或稍后重新发送。
          </p>
          <Button
            color="primary"
            variant="solid"
            className="ml-auto"
            isLoading={loading}
            onPress={handleUpdateEmail}
          >
            保存
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
