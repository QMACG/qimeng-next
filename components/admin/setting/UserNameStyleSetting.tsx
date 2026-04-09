'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Input } from '@heroui/react'
import toast from 'react-hot-toast'
import { kunFetchPut } from '~/utils/kunFetch'
import { USER_ROLE_MAP } from '~/constants/user'
import type { AdminUserNameStyleConfig } from '~/types/api/admin'
import { UserName } from '~/components/kun/user/UserName'

interface Props {
  config: AdminUserNameStyleConfig
}

export const UserNameStyleSetting = ({ config }: Props) => {
  const [role1Color, setRole1Color] = useState(config.role1Color)
  const [role2Color, setRole2Color] = useState(config.role2Color)
  const [role3Color, setRole3Color] = useState(config.role3Color)
  const [role4Color, setRole4Color] = useState(config.role4Color)
  const [saving, setSaving] = useState(false)

  const items = [
    {
      role: 1,
      label: USER_ROLE_MAP[1],
      value: role1Color,
      setValue: setRole1Color
    },
    {
      role: 2,
      label: USER_ROLE_MAP[2],
      value: role2Color,
      setValue: setRole2Color
    },
    {
      role: 3,
      label: USER_ROLE_MAP[3],
      value: role3Color,
      setValue: setRole3Color
    },
    {
      role: 4,
      label: USER_ROLE_MAP[4],
      value: role4Color,
      setValue: setRole4Color
    }
  ] as const

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await kunFetchPut<KunResponse<{}>>(
        '/admin/setting/user-name-style',
        {
          role1Color,
          role2Color,
          role3Color,
          role4Color
        }
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success('昵称配色已保存')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存昵称配色失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">用户组昵称配色</h3>
            <p className="text-sm text-default-500">
              保存后会同步影响评论区、反馈区、评分区、资料卡、顶栏和主要用户信息展示位置。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.role}
                className="rounded-2xl border border-default-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="mt-1 text-sm text-default-500">
                      预览：
                      <UserName
                        name={`${item.label}昵称`}
                        role={item.role}
                        className="ml-2 font-semibold"
                      />
                    </div>
                  </div>

                  <input
                    type="color"
                    value={item.value}
                    onChange={(event) => item.setValue(event.target.value)}
                    className="h-11 w-16 cursor-pointer rounded-xl border border-default-200 bg-transparent p-1"
                  />
                </div>

                <Input
                  className="mt-3"
                  label="十六进制颜色"
                  labelPlacement="outside"
                  value={item.value}
                  onValueChange={item.setValue}
                />
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button
          color="primary"
          isLoading={saving}
          isDisabled={saving}
          onPress={handleSave}
        >
          保存设置
        </Button>
      </div>
    </div>
  )
}

