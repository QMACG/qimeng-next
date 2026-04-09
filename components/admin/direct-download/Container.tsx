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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Textarea
} from '@heroui/react'
import {
  Ban,
  Clock3,
  Download,
  Plus,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldX,
  Trash2,
  Users
} from 'lucide-react'
import {
  kunFetchDelete,
  kunFetchGet,
  kunFetchPost,
  kunFetchPut
} from '~/utils/kunFetch'
import { formatDate } from '~/utils/time'
import type {
  AdminDirectDownloadConfig,
  AdminDirectDownloadIpBlacklistItem,
  AdminDirectDownloadLogItem,
  AdminDirectDownloadLogResponse,
  AdminDirectDownloadStatisticsResponse,
  AdminDirectDownloadUserBlacklistItem
} from '~/types/api/direct-download'

interface Props {
  initialConfig: AdminDirectDownloadConfig
  initialStatistics: AdminDirectDownloadStatisticsResponse
  initialLogs: AdminDirectDownloadLogResponse
  initialIpBlacklist: AdminDirectDownloadIpBlacklistItem[]
  initialUserBlacklist: AdminDirectDownloadUserBlacklistItem[]
}

type DeleteTarget =
  | { type: 'ip'; item: AdminDirectDownloadIpBlacklistItem }
  | { type: 'user'; item: AdminDirectDownloadUserBlacklistItem }

const statusColorMap: Record<string, 'success' | 'danger' | 'default'> = {
  success: 'success',
  blocked: 'danger'
}

const formatCount = (value: number) =>
  new Intl.NumberFormat('zh-CN').format(value)

export const AdminDirectDownloadContainer = ({
  initialConfig,
  initialStatistics,
  initialLogs,
  initialIpBlacklist,
  initialUserBlacklist
}: Props) => {
  const [config, setConfig] = useState(initialConfig)
  const [configSubmitting, setConfigSubmitting] = useState(false)

  const [statistics, setStatistics] = useState(initialStatistics)
  const [statisticsLoading, setStatisticsLoading] = useState(false)

  const [logs, setLogs] = useState(initialLogs)
  const [logsLoading, setLogsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [logFilters, setLogFilters] = useState({
    search: '',
    patchKeyword: '',
    userKeyword: '',
    status: 'all'
  })

  const [ipBlacklist, setIpBlacklist] = useState(initialIpBlacklist)
  const [userBlacklist, setUserBlacklist] = useState(initialUserBlacklist)
  const [ipForm, setIpForm] = useState({
    ip: '',
    reason: ''
  })
  const [userForm, setUserForm] = useState({
    userId: '',
    reason: ''
  })
  const [ipSubmitting, setIpSubmitting] = useState(false)
  const [userSubmitting, setUserSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = useState(false)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(logs.total / 20)),
    [logs.total]
  )

  const loadStatistics = async () => {
    setStatisticsLoading(true)

    try {
      const response = await kunFetchGet<
        KunResponse<AdminDirectDownloadStatisticsResponse>
      >('/admin/direct-download/statistics')

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setStatistics(response)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '加载直链统计失败')
    } finally {
      setStatisticsLoading(false)
    }
  }

  const loadLogs = async (nextPage = page, filters = logFilters) => {
    setLogsLoading(true)

    try {
      const response = await kunFetchGet<
        KunResponse<AdminDirectDownloadLogResponse>
      >('/admin/direct-download/log', {
        page: nextPage,
        limit: 20,
        search: filters.search,
        patchKeyword: filters.patchKeyword,
        userKeyword: filters.userKeyword,
        status: filters.status
      })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setLogs(response)
      setPage(nextPage)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '加载下载记录失败')
    } finally {
      setLogsLoading(false)
    }
  }

  const refreshConfig = async () => {
    try {
      const response = await kunFetchGet<
        KunResponse<AdminDirectDownloadConfig>
      >('/admin/direct-download/config')
      if (typeof response === 'string') {
        toast.error(response)
        return
      }
      setConfig(response)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '刷新配置失败')
    }
  }

  const refreshIpBlacklist = async () => {
    try {
      const response = await kunFetchGet<
        KunResponse<AdminDirectDownloadIpBlacklistItem[]>
      >('/admin/direct-download/ip-blacklist')
      if (typeof response === 'string') {
        toast.error(response)
        return
      }
      setIpBlacklist(response)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '刷新 IP 黑名单失败')
    }
  }

  const refreshUserBlacklist = async () => {
    try {
      const response = await kunFetchGet<
        KunResponse<AdminDirectDownloadUserBlacklistItem[]>
      >('/admin/direct-download/user-blacklist')
      if (typeof response === 'string') {
        toast.error(response)
        return
      }
      setUserBlacklist(response)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '刷新用户黑名单失败')
    }
  }

  const saveConfig = async () => {
    setConfigSubmitting(true)

    try {
      const response = await kunFetchPut<KunResponse<{}>>(
        '/admin/direct-download/config',
        {
          enableDownload: config.enableDownload,
          requireCaptcha: config.requireCaptcha,
          recordLogs: config.recordLogs,
          rateLimitWindowMinutes: config.rateLimitWindowMinutes,
          rateLimitMaxCount: config.rateLimitMaxCount
        }
      )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      toast.success('直链下载设置已保存')
      await refreshConfig()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '保存设置失败')
    } finally {
      setConfigSubmitting(false)
    }
  }

  const addIpBlacklist = async () => {
    setIpSubmitting(true)

    try {
      const response = await kunFetchPost<
        KunResponse<AdminDirectDownloadIpBlacklistItem>
      >('/admin/direct-download/ip-blacklist', {
        ip: ipForm.ip,
        reason: ipForm.reason
      })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setIpBlacklist((current) => [response, ...current])
      setIpForm({ ip: '', reason: '' })
      toast.success('IP 黑名单已添加')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '添加 IP 黑名单失败')
    } finally {
      setIpSubmitting(false)
    }
  }

  const addUserBlacklist = async () => {
    setUserSubmitting(true)

    try {
      const response = await kunFetchPost<
        KunResponse<AdminDirectDownloadUserBlacklistItem>
      >('/admin/direct-download/user-blacklist', {
        userId: Number(userForm.userId),
        reason: userForm.reason
      })

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setUserBlacklist((current) => [response, ...current])
      setUserForm({ userId: '', reason: '' })
      toast.success('用户黑名单已添加')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '添加用户黑名单失败')
    } finally {
      setUserSubmitting(false)
    }
  }

  const removeBlacklist = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)

    try {
      const response =
        deleteTarget.type === 'ip'
          ? await kunFetchDelete<KunResponse<{}>>(
              '/admin/direct-download/ip-blacklist',
              { id: deleteTarget.item.id }
            )
          : await kunFetchDelete<KunResponse<{}>>(
              '/admin/direct-download/user-blacklist',
              { id: deleteTarget.item.id }
            )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      if (deleteTarget.type === 'ip') {
        setIpBlacklist((current) =>
          current.filter((item) => item.id !== deleteTarget.item.id)
        )
      } else {
        setUserBlacklist((current) =>
          current.filter((item) => item.id !== deleteTarget.item.id)
        )
      }

      toast.success('黑名单记录已删除')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除黑名单记录失败')
    } finally {
      setDeleting(false)
    }
  }

  const overviewCards = [
    {
      label: '总下载请求',
      value: statistics.overview.totalRequests,
      color: 'primary' as const,
      icon: Download
    },
    {
      label: '成功下载',
      value: statistics.overview.successRequests,
      color: 'success' as const,
      icon: ShieldAlert
    },
    {
      label: '拦截次数',
      value: statistics.overview.blockedRequests,
      color: 'danger' as const,
      icon: ShieldX
    },
    {
      label: '近 24 小时',
      value: statistics.overview.recent24Hours,
      color: 'secondary' as const,
      icon: Clock3
    },
    {
      label: '近 7 天',
      value: statistics.overview.recent7Days,
      color: 'warning' as const,
      icon: Clock3
    },
    {
      label: '活跃用户数',
      value: statistics.overview.uniqueUsers,
      color: 'default' as const,
      icon: Users
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">直链管理</h1>
          <p className="text-sm text-default-500">
            集中管理直链下载开关、验证码、限额、下载记录、统计和黑名单。
          </p>
        </div>

        <div className="flex gap-2">
          <Chip
            color={config.envReady ? 'success' : 'danger'}
            variant="flat"
            startContent={<ShieldAlert className="size-4" />}
          >
            {config.envReady
              ? `下载线路已就绪（${config.downloadHostsCount} 条）`
              : '下载线路环境变量未配置完整'}
          </Chip>
        </div>
      </div>

      <Tabs aria-label="直链管理" variant="underlined">
        <Tab key="statistics" title="统计概览">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {overviewCards.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.label}>
                    <CardBody className="gap-3">
                      <div className="flex items-center justify-between">
                        <Chip color={item.color} variant="flat">
                          {item.label}
                        </Chip>
                        <Icon className="size-4 text-default-400" />
                      </div>
                      <div className="text-3xl font-bold">
                        {formatCount(item.value)}
                      </div>
                    </CardBody>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Chip variant="flat">
                    涉及游戏 {statistics.overview.uniquePatches}
                  </Chip>
                  <Chip variant="flat">
                    涉及 IP {statistics.overview.uniqueIps}
                  </Chip>
                  <Chip variant="flat">
                    成功率{' '}
                    {statistics.overview.totalRequests > 0
                      ? `${Math.round((statistics.overview.successRequests / statistics.overview.totalRequests) * 100)}%`
                      : '0%'}
                  </Chip>
                </div>

                <Button
                  variant="flat"
                  startContent={<RefreshCcw className="size-4" />}
                  onPress={() => void loadStatistics()}
                  isLoading={statisticsLoading}
                >
                  刷新统计
                </Button>
              </CardBody>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardBody>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">热门游戏排行</h2>
                    <Chip variant="flat">按总请求排序</Chip>
                  </div>
                  <Table aria-label="热门游戏排行">
                    <TableHeader>
                      <TableColumn>游戏</TableColumn>
                      <TableColumn>成功</TableColumn>
                      <TableColumn>拦截</TableColumn>
                      <TableColumn>总计</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={statistics.topPatches}
                      emptyContent="暂无统计数据"
                    >
                      {(item) => (
                        <TableRow key={item.patchId}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-default-500">
                                #{item.patchId} / {item.uniqueId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCount(item.success)}</TableCell>
                          <TableCell>{formatCount(item.blocked)}</TableCell>
                          <TableCell>{formatCount(item.total)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">活跃用户排行</h2>
                    <Chip variant="flat">按总请求排序</Chip>
                  </div>
                  <Table aria-label="活跃用户排行">
                    <TableHeader>
                      <TableColumn>用户</TableColumn>
                      <TableColumn>成功</TableColumn>
                      <TableColumn>拦截</TableColumn>
                      <TableColumn>总计</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={statistics.topUsers}
                      emptyContent="暂无统计数据"
                    >
                      {(item) => (
                        <TableRow key={item.userId}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-default-500">
                                #{item.userId} / {item.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCount(item.success)}</TableCell>
                          <TableCell>{formatCount(item.blocked)}</TableCell>
                          <TableCell>{formatCount(item.total)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">高频 IP</h2>
                    <Chip variant="flat">按总请求排序</Chip>
                  </div>
                  <Table aria-label="高频 IP">
                    <TableHeader>
                      <TableColumn>IP</TableColumn>
                      <TableColumn>成功</TableColumn>
                      <TableColumn>拦截</TableColumn>
                      <TableColumn>总计</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={statistics.topIps}
                      emptyContent="暂无统计数据"
                    >
                      {(item) => (
                        <TableRow key={item.userIp}>
                          <TableCell className="break-all">
                            {item.userIp}
                          </TableCell>
                          <TableCell>{formatCount(item.success)}</TableCell>
                          <TableCell>{formatCount(item.blocked)}</TableCell>
                          <TableCell>{formatCount(item.total)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">常见拦截原因</h2>
                    <Chip variant="flat">按出现次数排序</Chip>
                  </div>
                  <Table aria-label="常见拦截原因">
                    <TableHeader>
                      <TableColumn>原因</TableColumn>
                      <TableColumn>次数</TableColumn>
                    </TableHeader>
                    <TableBody
                      items={statistics.blockedReasons}
                      emptyContent="暂无拦截记录"
                    >
                      {(item) => (
                        <TableRow key={item.reason}>
                          <TableCell className="max-w-[420px] break-all">
                            {item.reason}
                          </TableCell>
                          <TableCell>{formatCount(item.count)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardBody>
              </Card>
            </div>
          </div>
        </Tab>

        <Tab key="config" title="下载设置">
          <div className="space-y-6">
            <Card>
              <CardBody className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Switch
                    isSelected={config.enableDownload}
                    onValueChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        enableDownload: value
                      }))
                    }
                  >
                    启用直链下载
                  </Switch>

                  <Switch
                    isSelected={config.requireCaptcha}
                    onValueChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        requireCaptcha: value
                      }))
                    }
                  >
                    启用验证码
                  </Switch>

                  <Switch
                    isSelected={config.recordLogs}
                    onValueChange={(value) =>
                      setConfig((current) => ({
                        ...current,
                        recordLogs: value
                      }))
                    }
                  >
                    记录下载日志
                  </Switch>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    type="number"
                    label="限额时间窗口"
                    labelPlacement="outside"
                    value={String(config.rateLimitWindowMinutes)}
                    endContent={
                      <span className="text-xs text-default-400">分钟</span>
                    }
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        rateLimitWindowMinutes: Number(event.target.value) || 0
                      }))
                    }
                  />

                  <Input
                    type="number"
                    label="时间窗口内最多下载次数"
                    labelPlacement="outside"
                    value={String(config.rateLimitMaxCount)}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        rateLimitMaxCount: Number(event.target.value) || 0
                      }))
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    color="primary"
                    onPress={() => void saveConfig()}
                    isLoading={configSubmitting}
                    isDisabled={configSubmitting}
                  >
                    保存设置
                  </Button>

                  <Button
                    variant="flat"
                    startContent={<RefreshCcw className="size-4" />}
                    onPress={() => void refreshConfig()}
                  >
                    刷新
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="logs" title="下载记录">
          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <Input
                    label="综合搜索"
                    labelPlacement="outside"
                    placeholder="文件路径 / IP / 用户 / 游戏"
                    value={logFilters.search}
                    onChange={(event) =>
                      setLogFilters((current) => ({
                        ...current,
                        search: event.target.value
                      }))
                    }
                  />

                  <Input
                    label="按游戏筛选"
                    labelPlacement="outside"
                    placeholder="游戏 ID 或标题"
                    value={logFilters.patchKeyword}
                    onChange={(event) =>
                      setLogFilters((current) => ({
                        ...current,
                        patchKeyword: event.target.value
                      }))
                    }
                  />

                  <Input
                    label="按用户筛选"
                    labelPlacement="outside"
                    placeholder="用户 ID / 用户名 / 邮箱"
                    value={logFilters.userKeyword}
                    onChange={(event) =>
                      setLogFilters((current) => ({
                        ...current,
                        userKeyword: event.target.value
                      }))
                    }
                  />

                  <Select
                    label="状态"
                    labelPlacement="outside"
                    selectedKeys={new Set([logFilters.status])}
                    onSelectionChange={(keys) => {
                      const next = String(Array.from(keys)[0] ?? 'all')
                      setLogFilters((current) => ({
                        ...current,
                        status: next
                      }))
                    }}
                  >
                    <SelectItem key="all">全部</SelectItem>
                    <SelectItem key="success">成功</SelectItem>
                    <SelectItem key="blocked">拦截</SelectItem>
                  </Select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    color="primary"
                    startContent={<Search className="size-4" />}
                    onPress={() => void loadLogs(1)}
                    isLoading={logsLoading}
                  >
                    查询记录
                  </Button>

                  <Chip variant="flat" color="success">
                    成功 {logs.summary.success}
                  </Chip>
                  <Chip variant="flat" color="danger">
                    拦截 {logs.summary.blocked}
                  </Chip>
                  <Chip variant="flat">总计 {logs.summary.total}</Chip>
                </div>
              </CardBody>
            </Card>

            <Table aria-label="直链下载记录">
              <TableHeader>
                <TableColumn>时间</TableColumn>
                <TableColumn>状态</TableColumn>
                <TableColumn>游戏 / 资源</TableColumn>
                <TableColumn>用户</TableColumn>
                <TableColumn>IP</TableColumn>
                <TableColumn>文件路径</TableColumn>
                <TableColumn>备注</TableColumn>
              </TableHeader>
              <TableBody items={logs.items} emptyContent="暂无下载记录">
                {(item: AdminDirectDownloadLogItem) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {formatDate(item.created, {
                        isShowYear: true,
                        isPrecise: true
                      })}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={statusColorMap[item.status] ?? 'default'}
                        variant="flat"
                      >
                        {item.status === 'success' ? '成功' : '拦截'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{item.patch?.name || '未匹配到游戏'}</div>
                        <div className="text-xs text-default-500">
                          {item.resource?.name || '未填写资源标题'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.user ? (
                        <div className="space-y-1">
                          <div>{item.user.name}</div>
                          <div className="text-xs text-default-500">
                            #{item.user.id} / {item.user.email}
                          </div>
                        </div>
                      ) : (
                        '未知用户'
                      )}
                    </TableCell>
                    <TableCell>{item.userIp || '-'}</TableCell>
                    <TableCell className="max-w-[360px] break-all">
                      {item.filePath}
                    </TableCell>
                    <TableCell className="max-w-[280px] break-all text-sm text-default-500">
                      {item.reason || '-'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <p className="text-sm text-default-500">
                第 {page} / {totalPages} 页
              </p>
              <div className="flex gap-2">
                <Button
                  variant="flat"
                  isDisabled={page <= 1 || logsLoading}
                  onPress={() => void loadLogs(page - 1)}
                >
                  上一页
                </Button>
                <Button
                  variant="flat"
                  isDisabled={page >= totalPages || logsLoading}
                  onPress={() => void loadLogs(page + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>
        </Tab>

        <Tab key="ip-blacklist" title="IP 黑名单">
          <div className="space-y-4">
            <Card>
              <CardBody className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto] md:items-end">
                <Input
                  label="IP"
                  labelPlacement="outside"
                  placeholder="例如 127.0.0.1"
                  value={ipForm.ip}
                  onChange={(event) =>
                    setIpForm((current) => ({
                      ...current,
                      ip: event.target.value
                    }))
                  }
                />
                <Textarea
                  label="备注"
                  labelPlacement="outside"
                  minRows={2}
                  placeholder="可选，记录拉黑原因"
                  value={ipForm.reason}
                  onChange={(event) =>
                    setIpForm((current) => ({
                      ...current,
                      reason: event.target.value
                    }))
                  }
                />
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    startContent={<Plus className="size-4" />}
                    onPress={() => void addIpBlacklist()}
                    isLoading={ipSubmitting}
                  >
                    添加
                  </Button>
                  <Button
                    variant="flat"
                    onPress={() => void refreshIpBlacklist()}
                  >
                    刷新
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Table aria-label="IP 黑名单">
              <TableHeader>
                <TableColumn>IP</TableColumn>
                <TableColumn>备注</TableColumn>
                <TableColumn>更新时间</TableColumn>
                <TableColumn>操作</TableColumn>
              </TableHeader>
              <TableBody items={ipBlacklist} emptyContent="暂无 IP 黑名单">
                {(item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.ip}</TableCell>
                    <TableCell className="max-w-[420px] break-all">
                      {item.reason || '-'}
                    </TableCell>
                    <TableCell>
                      {formatDate(item.updated, {
                        isShowYear: true,
                        isPrecise: true
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => setDeleteTarget({ type: 'ip', item })}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Tab>

        <Tab key="user-blacklist" title="用户黑名单">
          <div className="space-y-4">
            <Card>
              <CardBody className="grid gap-4 md:grid-cols-[220px_1.5fr_auto] md:items-end">
                <Input
                  label="用户 ID"
                  labelPlacement="outside"
                  placeholder="请输入用户 ID"
                  value={userForm.userId}
                  onChange={(event) =>
                    setUserForm((current) => ({
                      ...current,
                      userId: event.target.value
                    }))
                  }
                />
                <Textarea
                  label="备注"
                  labelPlacement="outside"
                  minRows={2}
                  placeholder="可选，记录拉黑原因"
                  value={userForm.reason}
                  onChange={(event) =>
                    setUserForm((current) => ({
                      ...current,
                      reason: event.target.value
                    }))
                  }
                />
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    startContent={<Ban className="size-4" />}
                    onPress={() => void addUserBlacklist()}
                    isLoading={userSubmitting}
                  >
                    添加
                  </Button>
                  <Button
                    variant="flat"
                    onPress={() => void refreshUserBlacklist()}
                  >
                    刷新
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Table aria-label="用户黑名单">
              <TableHeader>
                <TableColumn>用户</TableColumn>
                <TableColumn>备注</TableColumn>
                <TableColumn>更新时间</TableColumn>
                <TableColumn>操作</TableColumn>
              </TableHeader>
              <TableBody items={userBlacklist} emptyContent="暂无用户黑名单">
                {(item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{item.user.name}</div>
                        <div className="text-xs text-default-500">
                          #{item.user.id} / {item.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[420px] break-all">
                      {item.reason || '-'}
                    </TableCell>
                    <TableCell>
                      {formatDate(item.updated, {
                        isShowYear: true,
                        isPrecise: true
                      })}
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => setDeleteTarget({ type: 'user', item })}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null)
          }
        }}
      >
        <ModalContent>
          <ModalHeader>删除黑名单记录</ModalHeader>
          <ModalBody>
            <p className="break-all text-default-600">
              {deleteTarget?.type === 'ip'
                ? `确定要移除 IP 黑名单“${deleteTarget.item.ip}”吗？`
                : `确定要移除用户黑名单“${deleteTarget?.type === 'user' ? deleteTarget.item.user.name : ''}”吗？`}
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
              onPress={() => void removeBlacklist()}
              isLoading={deleting}
              isDisabled={deleting}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
