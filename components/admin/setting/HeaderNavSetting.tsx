'use client'

import { useState } from 'react'
import { Button, Card, CardBody, Input } from '@heroui/react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { kunFetchPut } from '~/utils/kunFetch'
import type { AdminHeaderNavConfig, AdminHeaderNavItem } from '~/types/api/admin'

interface Props {
  config: AdminHeaderNavConfig
}

const sortItems = (items: AdminHeaderNavItem[]) =>
  [...items].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)
  )

const normalizeSortOrder = (items: AdminHeaderNavItem[]) =>
  sortItems(items).map((item, index) => ({
    ...item,
    sortOrder: (index + 1) * 10
  }))

const createCustomId = () =>
  `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const HeaderNavSetting = ({ config }: Props) => {
  const [items, setItems] = useState<AdminHeaderNavItem[]>(
    normalizeSortOrder(config.items)
  )
  const [saving, setSaving] = useState(false)

  const moveItem = (targetId: string, direction: -1 | 1) => {
    setItems((current) => {
      const ordered = sortItems(current)
      const index = ordered.findIndex((item) => item.id === targetId)
      const targetIndex = index + direction

      if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
        return current
      }

      const next = [...ordered]
      ;[next[index], next[targetIndex]] = [next[targetIndex]!, next[index]!]

      return normalizeSortOrder(next)
    })
  }

  const updateItem = (
    targetId: string,
    key: keyof Pick<AdminHeaderNavItem, 'name' | 'href'>,
    value: string
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === targetId
          ? {
              ...item,
              [key]: value
            }
          : item
      )
    )
  }

  const addCustomItem = () => {
    setItems((current) =>
      normalizeSortOrder([
        ...current,
        {
          id: createCustomId(),
          name: '新导航',
          href: '/',
          sortOrder: current.length * 10 + 10,
          isFixed: false
        }
      ])
    )
  }

  const removeCustomItem = (targetId: string) => {
    setItems((current) =>
      normalizeSortOrder(
        current.filter((item) => item.isFixed || item.id !== targetId)
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await kunFetchPut<KunResponse<AdminHeaderNavConfig>>(
        '/admin/setting/header-nav',
        {
          items: normalizeSortOrder(items)
        }
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setItems(normalizeSortOrder(response.items))
      toast.success('页头导航设置已保存')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存页头导航设置失败')
    } finally {
      setSaving(false)
    }
  }

  const orderedItems = sortItems(items)

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">页头导航</h3>
            <p className="mt-1 text-sm text-default-500">
              游戏资源、游戏标签、会社、文章这四项会固定展示，你可以调整顺序；也可以新增自定义导航项并调整顺序。
            </p>
          </div>

          <div className="space-y-3">
            {orderedItems.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-default-200 p-4"
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
                  <Input
                    label={item.isFixed ? '固定名称' : '导航名称'}
                    value={item.name}
                    isReadOnly={item.isFixed}
                    onValueChange={(value) => updateItem(item.id, 'name', value)}
                  />

                  <Input
                    label="跳转链接"
                    value={item.href}
                    onValueChange={(value) => updateItem(item.id, 'href', value)}
                  />

                  <div className="flex items-end gap-2">
                    <Button
                      isIconOnly
                      variant="flat"
                      onPress={() => moveItem(item.id, -1)}
                      isDisabled={index === 0}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      isIconOnly
                      variant="flat"
                      onPress={() => moveItem(item.id, 1)}
                      isDisabled={index === orderedItems.length - 1}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    {!item.isFixed ? (
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        onPress={() => removeCustomItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-start">
            <Button
              variant="flat"
              startContent={<Plus className="size-4" />}
              onPress={addCustomItem}
            >
              添加自定义导航
            </Button>
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
