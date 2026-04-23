'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Switch, Textarea } from '@heroui/react'
import toast from 'react-hot-toast'
import { kunFetchPut } from '~/utils/kunFetch'
import type { AdminCommentAuditConfig } from '~/types/api/admin'

interface Props {
  config: AdminCommentAuditConfig
}

const listToText = (value: string[]) => value.join('\n')

const textToList = (value: string) => [
  ...new Set(
    value
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  )
]

export const CommentAuditSetting = ({ config }: Props) => {
  const [enableAudit, setEnableAudit] = useState(config.enableAudit)
  const [enableUsernameAudit, setEnableUsernameAudit] = useState(
    config.enableUsernameAudit
  )
  const [feedbackRequireCaptcha, setFeedbackRequireCaptcha] = useState(
    config.feedbackRequireCaptcha
  )
  const [minReviewLength, setMinReviewLength] = useState(
    String(config.minReviewLength)
  )
  const [keywordBlacklist, setKeywordBlacklist] = useState(
    listToText(config.keywordBlacklist)
  )
  const [keywordWhitelist, setKeywordWhitelist] = useState(
    listToText(config.keywordWhitelist)
  )
  const [userBlacklist, setUserBlacklist] = useState(
    listToText(config.userBlacklist)
  )
  const [userWhitelist, setUserWhitelist] = useState(
    listToText(config.userWhitelist)
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await kunFetchPut<KunResponse<{}>>(
        '/admin/comment/audit',
        {
          enableAudit,
          enableUsernameAudit,
          feedbackRequireCaptcha,
          minReviewLength: Number(minReviewLength) || 0,
          keywordBlacklist: textToList(keywordBlacklist),
          keywordWhitelist: textToList(keywordWhitelist),
          userBlacklist: textToList(userBlacklist),
          userWhitelist: textToList(userWhitelist)
        }
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success('评论审核设置已保存')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '保存评论审核设置失败'
      )
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
              <h3 className="text-lg font-semibold">启用云审核</h3>
              <p className="text-sm text-default-500">
                开启后，评论、反馈评论和游戏简评会在满足字数条件时接入阿里云内容审核。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={enableAudit}
              onValueChange={setEnableAudit}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">启用用户名审核</h3>
              <p className="text-sm text-default-500">
                开启后，用户注册和修改用户名时会进行内容审核。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={enableUsernameAudit}
              onValueChange={setEnableUsernameAudit}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">反馈发布验证码</h3>
              <p className="text-sm text-default-500">
                开启后，普通用户在前台发布反馈评论或回复时，需要先完成一次站内验证码验证。
              </p>
            </div>
            <Switch
              color="primary"
              isSelected={feedbackRequireCaptcha}
              onValueChange={setFeedbackRequireCaptcha}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-default-200 p-4">
              <h4 className="font-semibold">云审核触发字数</h4>
              <p className="mt-1 text-sm text-default-500">
                评论或简评达到这个字数后，才会调用云审核。本地黑白名单始终生效。
              </p>
              <input
                type="number"
                min={0}
                className="mt-3 w-full rounded-xl border border-default-200 bg-background px-3 py-2 outline-none"
                value={minReviewLength}
                onChange={(event) => setMinReviewLength(event.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-default-200 p-4">
              <h4 className="font-semibold">名单填写说明</h4>
              <p className="mt-1 text-sm text-default-500">
                支持换行、逗号或分号分隔。用户名单可填写用户名，也可填写用户
                ID。
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Textarea
              label="关键词黑名单"
              labelPlacement="outside"
              minRows={8}
              placeholder="命中后直接拦截"
              value={keywordBlacklist}
              onValueChange={setKeywordBlacklist}
            />

            <Textarea
              label="关键词白名单"
              labelPlacement="outside"
              minRows={8}
              placeholder="命中后直接放行，不再进入云审核"
              value={keywordWhitelist}
              onValueChange={setKeywordWhitelist}
            />

            <Textarea
              label="用户黑名单"
              labelPlacement="outside"
              minRows={8}
              placeholder="支持用户名或用户 ID"
              value={userBlacklist}
              onValueChange={setUserBlacklist}
            />

            <Textarea
              label="用户白名单"
              labelPlacement="outside"
              minRows={8}
              placeholder="支持用户名或用户 ID"
              value={userWhitelist}
              onValueChange={setUserWhitelist}
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
