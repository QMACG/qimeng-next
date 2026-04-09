'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Chip, Input, Switch } from '@heroui/react'
import { ExternalLink, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { kunFetchPut } from '~/utils/kunFetch'
import type { AdminRedirectConfig } from '~/types/api/admin'

interface Props {
  setting: AdminRedirectConfig
}

export const RedirectSetting = ({ setting }: Props) => {
  const [isEnabled, setIsEnabled] = useState(setting.enableRedirect)
  const [excludedDomains, setExcludedDomains] = useState<string[]>(
    setting.excludedDomains
  )
  const [newDomain, setNewDomain] = useState('')
  const [isSetting, setIsSetting] = useState(false)

  const addExcludedDomain = () => {
    const normalizedDomain = newDomain.trim().toLowerCase()
    if (!normalizedDomain || excludedDomains.includes(normalizedDomain)) {
      return
    }

    setExcludedDomains([...excludedDomains, normalizedDomain])
    setNewDomain('')
  }

  const removeDomain = (domain: string) => {
    setExcludedDomains(excludedDomains.filter((item) => item !== domain))
  }

  const handleApplyRedirect = async () => {
    setIsSetting(true)

    try {
      const res = await kunFetchPut<KunResponse<{}>>(
        '/admin/setting/redirect',
        {
          enableRedirect: isEnabled,
          excludedDomains,
          delaySeconds: 0
        }
      )

      if (typeof res === 'string') {
        toast.error(res)
      } else {
        setNewDomain('')
        toast.success('外链跳转设置已保存')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      setIsSetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">外链跳转</h3>
              <p className="text-small text-default-500">
                未加入白名单的外部链接会先进入确认页，由用户手动确认后再继续访问。
              </p>
            </div>
            <Switch
              isSelected={isEnabled}
              onValueChange={setIsEnabled}
              size="lg"
              color="primary"
              startContent={<ExternalLink className="h-4 w-4" />}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">直通域名</h3>
            <p className="text-sm font-medium text-default-500">
              命中这些域名的链接将直接打开，不经过跳转确认页。例如：
              `acgs.one`、`pan.example.com`
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              value={newDomain}
              onChange={(event) => setNewDomain(event.target.value)}
              placeholder="请输入域名，不要带 http:// 或 https://"
            />

            <Button
              isIconOnly
              variant="flat"
              color="primary"
              onPress={addExcludedDomain}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {excludedDomains.map((domain) => (
              <Chip
                key={domain}
                onClose={() => removeDomain(domain)}
                variant="flat"
                color="secondary"
              >
                {domain}
              </Chip>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-default-500">保存后立即生效。</p>
        <Button
          variant="shadow"
          color="primary"
          onPress={handleApplyRedirect}
          isLoading={isSetting}
          isDisabled={isSetting}
        >
          保存设置
        </Button>
      </div>
    </div>
  )
}
