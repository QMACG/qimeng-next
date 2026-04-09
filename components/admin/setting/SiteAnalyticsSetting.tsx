'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Button,
  Card,
  CardBody,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea
} from '@heroui/react'
import { PauseCircle, Plus, Save, Trash2 } from 'lucide-react'
import {
  kunFetchDelete,
  kunFetchGet,
  kunFetchPost,
  kunFetchPut
} from '~/utils/kunFetch'
import { formatDate } from '~/utils/time'
import type {
  AdminSiteAnalyticsPosition,
  AdminSiteAnalyticsScript
} from '~/types/api/admin'

interface Props {
  scripts: AdminSiteAnalyticsScript[]
}

const defaultForm = {
  id: 0,
  name: '',
  position: 'body_end' as AdminSiteAnalyticsPosition,
  content: '',
  isEnabled: true,
  sortOrder: 0
}

export const SiteAnalyticsSetting = ({ scripts }: Props) => {
  const [items, setItems] = useState(scripts)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [deleteTarget, setDeleteTarget] =
    useState<AdminSiteAnalyticsScript | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [disableAllOpen, setDisableAllOpen] = useState(false)
  const [disablingAll, setDisablingAll] = useState(false)

  const isEditing = useMemo(() => form.id > 0, [form.id])
  const enabledCount = useMemo(
    () => items.filter((item) => item.isEnabled).length,
    [items]
  )

  const refresh = async () => {
    setLoading(true)

    try {
      const response = await kunFetchGet<
        KunResponse<AdminSiteAnalyticsScript[]>
      >('/admin/setting/site-analytics')
      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setItems(response)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '加载网站统计失败')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm(defaultForm)
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const payload = {
        name: form.name,
        position: form.position,
        content: form.content,
        isEnabled: form.isEnabled,
        sortOrder: form.sortOrder
      }

      const response = isEditing
        ? await kunFetchPut<KunResponse<AdminSiteAnalyticsScript>>(
            '/admin/setting/site-analytics',
            {
              id: form.id,
              ...payload
            }
          )
        : await kunFetchPost<KunResponse<AdminSiteAnalyticsScript>>(
            '/admin/setting/site-analytics',
            payload
          )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      if (isEditing) {
        setItems((current) =>
          current
            .map((item) => (item.id === response.id ? response : item))
            .sort(
              (left, right) =>
                left.sortOrder - right.sortOrder || left.id - right.id
            )
        )
        toast.success('统计脚本已更新')
      } else {
        setItems((current) =>
          [...current, response].sort(
            (left, right) =>
              left.sortOrder - right.sortOrder || left.id - right.id
          )
        )
        toast.success('统计脚本已添加')
      }

      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存网站统计失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)

    try {
      const response = await kunFetchDelete<KunResponse<{}>>(
        '/admin/setting/site-analytics',
        {
          id: deleteTarget.id
        }
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setItems((current) =>
        current.filter((item) => item.id !== deleteTarget.id)
      )

      if (form.id === deleteTarget.id) {
        resetForm()
      }

      setDeleteTarget(null)
      toast.success('统计脚本已删除')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除网站统计失败')
    } finally {
      setDeleting(false)
    }
  }

  const handleDisableAll = async () => {
    setDisablingAll(true)

    try {
      const response = await kunFetchPost<KunResponse<{}>>(
        '/admin/setting/site-analytics/disable-all'
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setItems((current) =>
        current.map((item) => ({
          ...item,
          isEnabled: false
        }))
      )
      setForm((current) => ({
        ...current,
        isEnabled: false
      }))
      setDisableAllOpen(false)
      toast.success('已停用全部统计脚本')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '停用全部统计脚本失败'
      )
    } finally {
      setDisablingAll(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">网站统计脚本</h3>
              <p className="text-sm text-default-500">
                支持添加多段统计代码，可分别设置启用状态、注入位置和排序。
                统计脚本仅会注入前台页面，不会注入后台页面。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                color="warning"
                variant="flat"
                startContent={<PauseCircle className="size-4" />}
                onPress={() => setDisableAllOpen(true)}
                isDisabled={enabledCount === 0}
              >
                一键停用全部统计
              </Button>
              <Button
                variant="flat"
                onPress={refresh}
                isLoading={loading}
                isDisabled={loading}
              >
                刷新
              </Button>
              <Button
                variant="flat"
                startContent={<Plus className="size-4" />}
                onPress={resetForm}
              >
                新建
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="统计名称"
                  labelPlacement="outside"
                  placeholder="例如 百度统计"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                />

                <Input
                  type="number"
                  label="排序"
                  labelPlacement="outside"
                  value={String(form.sortOrder)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value) || 0
                    }))
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="注入位置"
                  labelPlacement="outside"
                  selectedKeys={new Set([form.position])}
                  onSelectionChange={(keys) => {
                    const next = String(Array.from(keys)[0] ?? 'body_end')
                    setForm((current) => ({
                      ...current,
                      position: next as AdminSiteAnalyticsPosition
                    }))
                  }}
                >
                  <SelectItem key="head">页面头部</SelectItem>
                  <SelectItem key="body_end">页面底部</SelectItem>
                </Select>

                <div className="flex items-end">
                  <div className="flex w-full items-center justify-between rounded-2xl border border-default-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">启用状态</p>
                      <p className="text-xs text-default-500">
                        关闭后将不再注入前台页面
                      </p>
                    </div>
                    <Switch
                      color="primary"
                      isSelected={form.isEnabled}
                      onValueChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          isEnabled: value
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Textarea
                label="统计代码"
                labelPlacement="outside"
                minRows={12}
                placeholder="<script>...</script>"
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    content: event.target.value
                  }))
                }
              />

              <div className="flex gap-2">
                <Button
                  color="primary"
                  startContent={<Save className="size-4" />}
                  onPress={() => void handleSave()}
                  isLoading={saving}
                  isDisabled={saving}
                >
                  {isEditing ? '保存修改' : '添加脚本'}
                </Button>

                {isEditing ? (
                  <Button variant="flat" onPress={resetForm}>
                    取消编辑
                  </Button>
                ) : null}
              </div>
            </div>

            <Card className="border border-default-200 shadow-none">
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold">当前脚本</h4>
                  <div className="flex gap-2">
                    <Chip variant="flat">{items.length} 条</Chip>
                    <Chip color="success" variant="flat">
                      已启用 {enabledCount}
                    </Chip>
                  </div>
                </div>

                <Table aria-label="网站统计脚本列表">
                  <TableHeader>
                    <TableColumn>名称</TableColumn>
                    <TableColumn>位置</TableColumn>
                    <TableColumn>状态</TableColumn>
                    <TableColumn>排序</TableColumn>
                    <TableColumn>操作</TableColumn>
                  </TableHeader>
                  <TableBody items={items} emptyContent="暂无统计脚本">
                    {(item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-default-500">
                              {formatDate(item.updated, {
                                isShowYear: true,
                                isPrecise: true
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.position === 'head' ? '页面头部' : '页面底部'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            color={item.isEnabled ? 'success' : 'default'}
                            variant="flat"
                          >
                            {item.isEnabled ? '已启用' : '已关闭'}
                          </Chip>
                        </TableCell>
                        <TableCell>{item.sortOrder}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() =>
                                setForm({
                                  id: item.id,
                                  name: item.name,
                                  position: item.position,
                                  content: item.content,
                                  isEnabled: item.isEnabled,
                                  sortOrder: item.sortOrder
                                })
                              }
                            >
                              编辑
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="flat"
                              onPress={() => setDeleteTarget(item)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </div>
        </CardBody>
      </Card>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null)
          }
        }}
      >
        <ModalContent>
          <ModalHeader>删除统计脚本</ModalHeader>
          <ModalBody>
            <p className="break-all text-default-600">
              确定要删除统计脚本“{deleteTarget?.name || ''}
              ”吗？删除后将不再注入前台页面。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setDeleteTarget(null)}
              isDisabled={deleting}
            >
              取消
            </Button>
            <Button
              color="danger"
              onPress={() => void handleDelete()}
              isLoading={deleting}
              isDisabled={deleting}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={disableAllOpen}
        onOpenChange={(open) => {
          if (!disablingAll) {
            setDisableAllOpen(open)
          }
        }}
      >
        <ModalContent>
          <ModalHeader>停用全部统计脚本</ModalHeader>
          <ModalBody>
            <p className="text-default-600">
              确定要一次性停用全部网站统计脚本吗？这不会删除脚本内容，只会统一关闭前台注入。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setDisableAllOpen(false)}
              isDisabled={disablingAll}
            >
              取消
            </Button>
            <Button
              color="warning"
              onPress={() => void handleDisableAll()}
              isLoading={disablingAll}
              isDisabled={disablingAll}
            >
              确认停用
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
