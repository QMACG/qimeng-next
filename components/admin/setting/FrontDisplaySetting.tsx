'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Switch, Textarea } from '@heroui/react'
import toast from 'react-hot-toast'
import { kunFetchPut } from '~/utils/kunFetch'
import type { AdminFrontDisplayConfig } from '~/types/api/admin'

interface Props {
  setting: AdminFrontDisplayConfig
}

export const FrontDisplaySetting = ({ setting }: Props) => {
  const [enableSite, setEnableSite] = useState(setting.enableSite)
  const [siteCloseMessage, setSiteCloseMessage] = useState(
    setting.siteCloseMessage
  )
  const [hideViewCountForVisitor, setHideViewCountForVisitor] = useState(
    setting.hideViewCountForVisitor
  )
  const [hideDownloadCountForVisitor, setHideDownloadCountForVisitor] =
    useState(setting.hideDownloadCountForVisitor)
  const [hideCreatorStatsForVisitor, setHideCreatorStatsForVisitor] = useState(
    setting.hideCreatorStatsForVisitor
  )
  const [enableContentScopeControl, setEnableContentScopeControl] = useState(
    setting.enableContentScopeControl
  )
  const [enablePatchRelatedGames, setEnablePatchRelatedGames] = useState(
    setting.enablePatchRelatedGames
  )
  const [enableFriendLinkApply, setEnableFriendLinkApply] = useState(
    setting.enableFriendLinkApply
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!enableSite && !siteCloseMessage.trim()) {
      toast.error('关闭站点时请填写站点提示')
      return
    }

    setSaving(true)

    try {
      const res = await kunFetchPut<KunResponse<{}>>(
        '/admin/setting/front-display',
        {
          enableSite,
          siteCloseMessage,
          hideViewCountForVisitor,
          hideDownloadCountForVisitor,
          hideCreatorStatsForVisitor,
          enableContentScopeControl,
          enablePatchRelatedGames,
          enableFriendLinkApply
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
              <h3 className="text-lg font-semibold">开启站点</h3>
              <p className="text-sm text-default-500">
                关闭后，前台访客页面会统一显示站点关闭提示，后台与登录入口不受影响。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={enableSite}
              onValueChange={setEnableSite}
            />
          </div>

          {!enableSite ? (
            <Textarea
              label="站点关闭提示"
              description="支持多行文本，用于向前台访客说明当前站点关闭原因或维护通知。"
              placeholder="例如：站点正在维护升级中，请稍后再访问。"
              minRows={6}
              value={siteCloseMessage}
              onValueChange={setSiteCloseMessage}
            />
          ) : null}

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

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">内容显示范围控制</h3>
              <p className="text-sm text-default-500">
                开启时保持当前分级过滤逻辑。关闭后，游客也能看到限制级条目，但封面会自动模糊，进入详情前需要二次确认。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={enableContentScopeControl}
              onValueChange={setEnableContentScopeControl}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">游戏页相关推荐</h3>
              <p className="text-sm text-default-500">
                开启后，会在游戏详情页的“游戏信息”标签底部显示 8 个相关推荐卡片。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={enablePatchRelatedGames}
              onValueChange={setEnablePatchRelatedGames}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">友链申请入口</h3>
              <p className="text-sm text-default-500">
                关闭后，前台友情链接页将隐藏“申请友情链接”入口，且无法提交新申请；已展示的友链与后台友链管理不受影响。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={enableFriendLinkApply}
              onValueChange={setEnableFriendLinkApply}
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
