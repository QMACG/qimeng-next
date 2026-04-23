'use client'

import { useState } from 'react'
import { Card, CardBody, CardFooter, Divider, Switch } from '@heroui/react'
import { Ban } from 'lucide-react'
import toast from 'react-hot-toast'
import { kunFetchPut } from '~/utils/kunFetch'

interface Props {
  disableRegister: boolean
}

export const DisableRegisterSetting = ({ disableRegister }: Props) => {
  const [isDisable, setIsDisable] = useState(disableRegister)

  const handleSwitch = async (value: boolean) => {
    try {
      const res = await kunFetchPut<KunResponse<{}>>(
        '/admin/setting/register',
        {
          disableRegister: value
        }
      )

      if (typeof res === 'string') {
        toast.error(res)
        return
      }

      setIsDisable(value)
      toast.success('注册设置已更新')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">关闭注册</h3>
              <p className="text-small text-default-500">
                开启后，除首号初始化场景外，新用户将无法继续注册站点账号。
              </p>
            </div>
            <Switch
              isSelected={isDisable}
              onValueChange={handleSwitch}
              size="lg"
              color="danger"
              startContent={<Ban className="h-4 w-4" />}
            />
          </div>
        </CardBody>
        <Divider />
        <CardFooter className="text-sm text-default-500">
          保存后立即生效，无需重启服务。
        </CardFooter>
      </Card>
    </div>
  )
}
