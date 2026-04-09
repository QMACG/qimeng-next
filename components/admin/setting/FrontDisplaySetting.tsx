'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Switch } from '@heroui/react'
import toast from 'react-hot-toast'
import { kunFetchPut } from '~/utils/kunFetch'
import type { AdminFrontDisplayConfig } from '~/types/api/admin'

interface Props {
  setting: AdminFrontDisplayConfig
}

export const FrontDisplaySetting = ({ setting }: Props) => {
  const [hideViewCountForVisitor, setHideViewCountForVisitor] = useState(
    setting.hideViewCountForVisitor
  )
  const [hideDownloadCountForVisitor, setHideDownloadCountForVisitor] =
    useState(setting.hideDownloadCountForVisitor)
  const [hideCreatorStatsForVisitor, setHideCreatorStatsForVisitor] = useState(
    setting.hideCreatorStatsForVisitor
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    try {
      const res = await kunFetchPut<KunResponse<{}>>(
        '/admin/setting/front-display',
        {
          hideViewCountForVisitor,
          hideDownloadCountForVisitor,
          hideCreatorStatsForVisitor
        }
      )

      if (typeof res === 'string') {
        toast.error(res)
      } else {
        toast.success('前台显示设置已保存')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">隐藏浏览数</h3>
              <p className="text-sm text-default-500">
                开启后，普通用户和游客在前台将不会看到游戏或文章的浏览数。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={hideViewCountForVisitor}
              onValueChange={setHideViewCountForVisitor}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">隐藏下载数</h3>
              <p className="text-sm text-default-500">
                开启后，普通用户和游客在前台将不会看到下载数。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={hideDownloadCountForVisitor}
              onValueChange={setHideDownloadCountForVisitor}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">隐藏作者产出统计</h3>
              <p className="text-sm text-default-500">
                开启后，普通用户和游客将不会看到作者维护的游戏数、资源数等统计。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={hideCreatorStatsForVisitor}
              onValueChange={setHideCreatorStatsForVisitor}
            />
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
