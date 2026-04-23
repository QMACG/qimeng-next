'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Button,
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
  Tabs
} from '@heroui/react'
import { Edit2, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { kunFetchDelete, kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
import { formatDate } from '~/utils/time'
import type {
  AdminAdvertisement,
  AdvertisementDocCandidate,
  FeaturedAdvertisementTargetMode
} from '~/types/api/advertisement'

const ADVERTISEMENT_API_PATH = '/admin/advertisement'

interface Props {
  initialAdvertisements: AdminAdvertisement[]
  docCandidates: AdvertisementDocCandidate[]
}

interface HomeBoxFormState {
  slot: number
  banner: string
  link: string
  visibleForGuest: boolean
}

interface RedirectBoxFormState {
  banner: string
  link: string
  visibleForGuest: boolean
  sortOrder: number
}

interface FeaturedPostFormState {
  docPostId: number
  targetMode: FeaturedAdvertisementTargetMode
  title: string
  banner: string
  link: string
  visibleForGuest: boolean
  sortOrder: number
}

const HOME_BOX_COLUMNS = [
  { name: '广告位', uid: 'slot' },
  { name: '预览', uid: 'preview' },
  { name: '游客可见', uid: 'guest' },
  { name: '跳转链接', uid: 'link' },
  { name: '更新时间', uid: 'updated' },
  { name: '操作', uid: 'actions' }
]

const FEATURED_COLUMNS = [
  { name: '标题', uid: 'title' },
  { name: '跳转方式', uid: 'targetMode' },
  { name: '游客可见', uid: 'guest' },
  { name: '排序', uid: 'sort' },
  { name: '目标链接', uid: 'link' },
  { name: '操作', uid: 'actions' }
]

const REDIRECT_COLUMNS = [
  { name: '预览', uid: 'preview' },
  { name: '游客可见', uid: 'guest' },
  { name: '排序', uid: 'sort' },
  { name: '跳转链接', uid: 'link' },
  { name: '更新时间', uid: 'updated' },
  { name: '操作', uid: 'actions' }
]

const targetModeOptions: Array<{
  key: FeaturedAdvertisementTargetMode
  label: string
  description: string
}> = [
  {
    key: 'article',
    label: '跳文章',
    description: '从 advertisement 目录中选一篇文章，点击后进入文章详情。'
  },
  {
    key: 'external',
    label: '独立图文广告',
    description: '直接填写标题、封面和链接，不再关联文章。'
  }
]

const EMPTY_HOME_FORM = (slot: number): HomeBoxFormState => ({
  slot,
  banner: '',
  link: '',
  visibleForGuest: true
})

const EMPTY_REDIRECT_FORM = (): RedirectBoxFormState => ({
  banner: '',
  link: '',
  visibleForGuest: true,
  sortOrder: 0
})

const EMPTY_FEATURED_FORM = (): FeaturedPostFormState => ({
  docPostId: 0,
  targetMode: 'article',
  title: '',
  banner: '',
  link: '',
  visibleForGuest: true,
  sortOrder: 0
})

const formatAdvertisementTime = (value: string) =>
  formatDate(value, {
    isShowYear: true,
    isPrecise: true
  })

const isExternalLink = (link: string) => /^https?:\/\//i.test(link)

const getFeaturedDisplayTitle = (advertisement: AdminAdvertisement) =>
  advertisement.docPost?.title || advertisement.title || '未命名广告'

const getFeaturedPreviewLink = (advertisement: AdminAdvertisement) => {
  if (advertisement.kind !== 'featured_post') {
    return advertisement.link
  }

  if (advertisement.targetMode === 'external') {
    return advertisement.link
  }

  return advertisement.docPost
    ? `/doc/${advertisement.docPost.slug}`
    : advertisement.link
}

const getFeaturedPreviewBanner = (advertisement: AdminAdvertisement) =>
  advertisement.docPost?.banner || advertisement.banner || '/favicon.ico'

const getFeaturedTargetModeLabel = (
  targetMode: FeaturedAdvertisementTargetMode | null
) => (targetMode === 'external' ? '独立图文广告' : '文章详情')

export const AdminAdvertisementContainer = ({
  initialAdvertisements,
  docCandidates
}: Props) => {
  const [advertisements, setAdvertisements] = useState<AdminAdvertisement[]>(
    initialAdvertisements
  )
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deletingAdvertisement, setDeletingAdvertisement] =
    useState<AdminAdvertisement | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [homeModalOpen, setHomeModalOpen] = useState(false)
  const [editingHomeAd, setEditingHomeAd] = useState<AdminAdvertisement | null>(
    null
  )
  const [homeForm, setHomeForm] = useState<HomeBoxFormState>(EMPTY_HOME_FORM(1))

  const [redirectModalOpen, setRedirectModalOpen] = useState(false)
  const [editingRedirectAd, setEditingRedirectAd] =
    useState<AdminAdvertisement | null>(null)
  const [redirectForm, setRedirectForm] = useState<RedirectBoxFormState>(
    EMPTY_REDIRECT_FORM()
  )

  const [featuredModalOpen, setFeaturedModalOpen] = useState(false)
  const [editingFeaturedAd, setEditingFeaturedAd] =
    useState<AdminAdvertisement | null>(null)
  const [featuredForm, setFeaturedForm] = useState<FeaturedPostFormState>(
    EMPTY_FEATURED_FORM()
  )

  const homeBoxAds = useMemo(
    () =>
      advertisements
        .filter((item) => item.kind === 'home_box')
        .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0)),
    [advertisements]
  )

  const redirectAds = useMemo(
    () =>
      advertisements
        .filter((item) => item.kind === 'redirect_box')
        .sort((a, b) => b.sortOrder - a.sortOrder || a.id - b.id),
    [advertisements]
  )

  const featuredAds = useMemo(
    () =>
      advertisements
        .filter((item) => item.kind === 'featured_post')
        .sort((a, b) => b.sortOrder - a.sortOrder || b.id - a.id),
    [advertisements]
  )

  const homeBoxRows = useMemo(
    () =>
      [1, 2, 3, 4].map((slot) => ({
        slot,
        advertisement: homeBoxAds.find((item) => item.slot === slot) ?? null
      })),
    [homeBoxAds]
  )

  const deleteTitle = useMemo(() => {
    if (!deletingAdvertisement) {
      return '删除广告'
    }
    if (deletingAdvertisement.kind === 'home_box') {
      return '删除首页广告'
    }
    if (deletingAdvertisement.kind === 'redirect_box') {
      return '删除跳转页广告'
    }
    return '删除置顶文章广告'
  }, [deletingAdvertisement])

  const deleteDescription = useMemo(() => {
    if (!deletingAdvertisement) {
      return ''
    }
    if (deletingAdvertisement.kind === 'home_box') {
      return '确认删除后，对应首页广告位会恢复为空，删除后不可恢复。'
    }
    if (deletingAdvertisement.kind === 'redirect_box') {
      return '确认删除后，外链跳转页将不再展示这条广告，删除后不可恢复。'
    }
    return '确认删除后，首页轮播将不再展示这条置顶文章广告，删除后不可恢复。'
  }, [deletingAdvertisement])

  const deleteSummary = useMemo(() => {
    if (!deletingAdvertisement) {
      return ''
    }

    if (deletingAdvertisement.kind === 'featured_post') {
      return `${getFeaturedDisplayTitle(deletingAdvertisement)} · ${getFeaturedPreviewLink(deletingAdvertisement)}`
    }

    if (deletingAdvertisement.kind === 'home_box') {
      return `广告位 ${deletingAdvertisement.slot ?? '-'} · ${deletingAdvertisement.link}`
    }

    return deletingAdvertisement.link
  }, [deletingAdvertisement])

  const upsertAdvertisement = (nextAdvertisement: AdminAdvertisement) => {
    setAdvertisements((current) => {
      const exists = current.some((item) => item.id === nextAdvertisement.id)
      if (exists) {
        return current.map((item) =>
          item.id === nextAdvertisement.id ? nextAdvertisement : item
        )
      }

      return [nextAdvertisement, ...current]
    })
  }

  const handleDelete = async () => {
    if (!deletingAdvertisement) {
      return
    }

    setDeletingId(deletingAdvertisement.id)
    try {
      const response = await kunFetchDelete<KunResponse<{}>>(
        ADVERTISEMENT_API_PATH,
        { id: deletingAdvertisement.id }
      )
      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      setAdvertisements((current) =>
        current.filter((item) => item.id !== deletingAdvertisement.id)
      )
      toast.success('广告已删除')
      setDeleteModalOpen(false)
      setDeletingAdvertisement(null)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '删除广告失败，请稍后重试'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handleCloseDelete = () => {
    if (deletingId) {
      return
    }

    setDeleteModalOpen(false)
    setDeletingAdvertisement(null)
  }

  const handleOpenDelete = (advertisement: AdminAdvertisement) => {
    setDeletingAdvertisement(advertisement)
    setDeleteModalOpen(true)
  }

  const handleOpenCreateHome = (slot: number) => {
    setEditingHomeAd(null)
    setHomeForm(EMPTY_HOME_FORM(slot))
    setHomeModalOpen(true)
  }

  const handleOpenEditHome = (advertisement: AdminAdvertisement) => {
    setEditingHomeAd(advertisement)
    setHomeForm({
      slot: advertisement.slot ?? 1,
      banner: advertisement.banner,
      link: advertisement.link,
      visibleForGuest: advertisement.visibleForGuest
    })
    setHomeModalOpen(true)
  }

  const submitHomeBox = async () => {
    setSubmitting(true)
    try {
      const payload = {
        kind: 'home_box' as const,
        title: '',
        slot: homeForm.slot,
        banner: homeForm.banner,
        link: homeForm.link,
        visibleForGuest: homeForm.visibleForGuest,
        sortOrder: 0,
        targetMode: null,
        docPostId: null
      }

      const response = editingHomeAd
        ? await kunFetchPut<KunResponse<AdminAdvertisement>>(
            ADVERTISEMENT_API_PATH,
            { id: editingHomeAd.id, ...payload }
          )
        : await kunFetchPost<KunResponse<AdminAdvertisement>>(
            ADVERTISEMENT_API_PATH,
            payload
          )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      upsertAdvertisement(response)
      setHomeModalOpen(false)
      toast.success(editingHomeAd ? '首页广告已更新' : '首页广告已创建')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '保存首页广告失败，请稍后重试'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenCreateRedirect = () => {
    setEditingRedirectAd(null)
    setRedirectForm(EMPTY_REDIRECT_FORM())
    setRedirectModalOpen(true)
  }

  const handleOpenEditRedirect = (advertisement: AdminAdvertisement) => {
    setEditingRedirectAd(advertisement)
    setRedirectForm({
      banner: advertisement.banner,
      link: advertisement.link,
      visibleForGuest: advertisement.visibleForGuest,
      sortOrder: advertisement.sortOrder
    })
    setRedirectModalOpen(true)
  }

  const submitRedirectBox = async () => {
    setSubmitting(true)
    try {
      const payload = {
        kind: 'redirect_box' as const,
        title: '',
        banner: redirectForm.banner,
        link: redirectForm.link,
        visibleForGuest: redirectForm.visibleForGuest,
        sortOrder: redirectForm.sortOrder,
        targetMode: null,
        docPostId: null
      }

      const response = editingRedirectAd
        ? await kunFetchPut<KunResponse<AdminAdvertisement>>(
            ADVERTISEMENT_API_PATH,
            { id: editingRedirectAd.id, ...payload }
          )
        : await kunFetchPost<KunResponse<AdminAdvertisement>>(
            ADVERTISEMENT_API_PATH,
            payload
          )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      upsertAdvertisement(response)
      setRedirectModalOpen(false)
      toast.success(editingRedirectAd ? '跳转页广告已更新' : '跳转页广告已创建')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '保存跳转页广告失败，请稍后重试'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenCreateFeatured = () => {
    setEditingFeaturedAd(null)
    setFeaturedForm(EMPTY_FEATURED_FORM())
    setFeaturedModalOpen(true)
  }

  const handleOpenEditFeatured = (advertisement: AdminAdvertisement) => {
    setEditingFeaturedAd(advertisement)
    setFeaturedForm({
      docPostId: advertisement.docPostId ?? 0,
      targetMode: advertisement.targetMode ?? 'article',
      title: advertisement.title,
      banner: advertisement.banner,
      link: advertisement.targetMode === 'external' ? advertisement.link : '',
      visibleForGuest: advertisement.visibleForGuest,
      sortOrder: advertisement.sortOrder
    })
    setFeaturedModalOpen(true)
  }

  const submitFeatured = async () => {
    setSubmitting(true)
    try {
      const payload =
        featuredForm.targetMode === 'external'
          ? {
              kind: 'featured_post' as const,
              targetMode: 'external' as const,
              title: featuredForm.title,
              banner: featuredForm.banner,
              link: featuredForm.link,
              docPostId: null,
              visibleForGuest: featuredForm.visibleForGuest,
              sortOrder: featuredForm.sortOrder
            }
          : {
              kind: 'featured_post' as const,
              targetMode: 'article' as const,
              title: '',
              banner: '',
              link: '',
              docPostId: featuredForm.docPostId,
              visibleForGuest: featuredForm.visibleForGuest,
              sortOrder: featuredForm.sortOrder
            }

      const response = editingFeaturedAd
        ? await kunFetchPut<KunResponse<AdminAdvertisement>>(
            ADVERTISEMENT_API_PATH,
            { id: editingFeaturedAd.id, ...payload }
          )
        : await kunFetchPost<KunResponse<AdminAdvertisement>>(
            ADVERTISEMENT_API_PATH,
            payload
          )

      if (typeof response === 'string') {
        toast.error(response)
        return
      }

      upsertAdvertisement(response)
      setFeaturedModalOpen(false)
      toast.success(
        editingFeaturedAd ? '置顶文章广告已更新' : '置顶文章广告已创建'
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : '保存置顶文章广告失败，请稍后重试'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">广告管理</h1>
      </div>

      <Tabs aria-label="广告管理" variant="underlined">
        <Tab key="home-box" title="首页广告框">
          <div className="space-y-6">
            <div className="rounded-2xl border border-divider bg-content1 p-4">
              <div className="flex flex-wrap gap-2">
                <Chip color="primary" variant="flat">
                  固定广告位 1 - 4
                </Chip>
                <Chip color="secondary" variant="flat">
                  点击后直接跳转
                </Chip>
                <Chip color="warning" variant="flat">
                  前台会根据可见广告数量自动调整布局
                </Chip>
              </div>
              <p className="mt-3 text-sm text-default-500">
                可见广告为 1 条时整卡展示，2 条时上下排列，3 条时上中下排列，4
                条时为 2 x 2 四宫格。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {homeBoxRows.map(({ slot, advertisement }) => (
                <div
                  key={slot}
                  className="overflow-hidden rounded-2xl border border-divider bg-content1"
                >
                  <div className="relative aspect-[4/3] bg-default-100">
                    {advertisement ? (
                      <img
                        src={advertisement.banner}
                        alt={`广告位 ${slot}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-default-500">
                        广告位 {slot}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">广告位 {slot}</span>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          advertisement?.visibleForGuest ? 'success' : 'warning'
                        }
                      >
                        {advertisement
                          ? advertisement.visibleForGuest
                            ? '游客可见'
                            : '仅登录可见'
                          : '未配置'}
                      </Chip>
                    </div>
                    <Button
                      size="sm"
                      fullWidth
                      color={advertisement ? 'default' : 'primary'}
                      variant={advertisement ? 'flat' : 'solid'}
                      onPress={() =>
                        advertisement
                          ? handleOpenEditHome(advertisement)
                          : handleOpenCreateHome(slot)
                      }
                    >
                      {advertisement ? '编辑广告位' : '配置广告位'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Table aria-label="首页广告框列表">
              <TableHeader columns={HOME_BOX_COLUMNS}>
                {(column) => (
                  <TableColumn key={column.uid}>{column.name}</TableColumn>
                )}
              </TableHeader>
              <TableBody items={homeBoxRows}>
                {(row) => (
                  <TableRow key={row.slot}>
                    <TableCell>广告位 {row.slot}</TableCell>
                    <TableCell>
                      {row.advertisement ? (
                        <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-divider">
                          <img
                            src={row.advertisement.banner}
                            alt={`广告位 ${row.slot}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-default-500">未配置</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.advertisement ? (
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            row.advertisement.visibleForGuest
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {row.advertisement.visibleForGuest ? '是' : '否'}
                        </Chip>
                      ) : (
                        <span className="text-sm text-default-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.advertisement ? (
                        <a
                          href={row.advertisement.link}
                          target={
                            isExternalLink(row.advertisement.link)
                              ? '_blank'
                              : undefined
                          }
                          rel={
                            isExternalLink(row.advertisement.link)
                              ? 'noopener noreferrer'
                              : undefined
                          }
                          className="break-all text-sm text-primary hover:underline"
                        >
                          {row.advertisement.link}
                        </a>
                      ) : (
                        <span className="text-sm text-default-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.advertisement ? (
                        <span className="text-sm text-default-600">
                          {formatAdvertisementTime(row.advertisement.updated)}
                        </span>
                      ) : (
                        <span className="text-sm text-default-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {row.advertisement ? (
                          <>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() =>
                                handleOpenEditHome(row.advertisement!)
                              }
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              as={Link}
                              href={row.advertisement.link}
                              target={
                                isExternalLink(row.advertisement.link)
                                  ? '_blank'
                                  : undefined
                              }
                              isIconOnly
                              size="sm"
                              variant="light"
                            >
                              <ExternalLink size={16} />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              isLoading={deletingId === row.advertisement.id}
                              onPress={() =>
                                handleOpenDelete(row.advertisement!)
                              }
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => handleOpenCreateHome(row.slot)}
                          >
                            配置
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Tab>

        <Tab key="redirect-box" title="跳转页广告">
          <div className="space-y-6">
            <div className="rounded-2xl border border-divider bg-content1 p-4">
              <div className="flex flex-wrap gap-2">
                <Chip color="primary" variant="flat">
                  仅展示 1 条
                </Chip>
                <Chip color="secondary" variant="flat">
                  排序值越大越靠前
                </Chip>
                <Chip color="warning" variant="flat">
                  点击后直接跳转
                </Chip>
              </div>
              <p className="mt-3 text-sm text-default-500">
                外链跳转页只会展示当前可见且排序最高的一条广告，建议保留 1 到 3
                条候选作为轮替。
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                color="primary"
                startContent={<Plus className="size-4" />}
                onPress={handleOpenCreateRedirect}
              >
                新建跳转页广告
              </Button>
            </div>

            <Table aria-label="跳转页广告列表">
              <TableHeader columns={REDIRECT_COLUMNS}>
                {(column) => (
                  <TableColumn key={column.uid}>{column.name}</TableColumn>
                )}
              </TableHeader>
              <TableBody items={redirectAds}>
                {(advertisement) => (
                  <TableRow key={advertisement.id}>
                    <TableCell>
                      <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-divider">
                        <img
                          src={advertisement.banner}
                          alt="跳转页广告"
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          advertisement.visibleForGuest ? 'success' : 'warning'
                        }
                      >
                        {advertisement.visibleForGuest ? '是' : '否'}
                      </Chip>
                    </TableCell>
                    <TableCell>{advertisement.sortOrder}</TableCell>
                    <TableCell>
                      <a
                        href={advertisement.link}
                        target={
                          isExternalLink(advertisement.link)
                            ? '_blank'
                            : undefined
                        }
                        rel={
                          isExternalLink(advertisement.link)
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        className="break-all text-sm text-primary hover:underline"
                      >
                        {advertisement.link}
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-default-600">
                        {formatAdvertisementTime(advertisement.updated)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleOpenEditRedirect(advertisement)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          as={Link}
                          href={advertisement.link}
                          target={
                            isExternalLink(advertisement.link)
                              ? '_blank'
                              : undefined
                          }
                          isIconOnly
                          size="sm"
                          variant="light"
                        >
                          <ExternalLink size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          isLoading={deletingId === advertisement.id}
                          onPress={() => handleOpenDelete(advertisement)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Tab>
        <Tab key="featured-post" title="置顶文章广告">
          <div className="space-y-6">
            <div className="rounded-2xl border border-divider bg-content1 p-4">
              <div className="flex flex-wrap gap-2">
                <Chip color="primary" variant="flat">
                  排序值越大越靠前
                </Chip>
                <Chip color="secondary" variant="flat">
                  文章模式可选 advertisement 目录文章
                </Chip>
                <Chip color="warning" variant="flat">
                  独立图文广告可直接填写标题、封面和链接
                </Chip>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                color="primary"
                startContent={<Plus className="size-4" />}
                onPress={handleOpenCreateFeatured}
              >
                新建置顶广告
              </Button>
            </div>

            <Table aria-label="置顶文章广告列表">
              <TableHeader columns={FEATURED_COLUMNS}>
                {(column) => (
                  <TableColumn key={column.uid}>{column.name}</TableColumn>
                )}
              </TableHeader>
              <TableBody items={featuredAds}>
                {(advertisement) => {
                  const previewLink = getFeaturedPreviewLink(advertisement)

                  return (
                    <TableRow key={advertisement.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-20 overflow-hidden rounded-lg border border-divider">
                            <img
                              src={getFeaturedPreviewBanner(advertisement)}
                              alt={getFeaturedDisplayTitle(advertisement)}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {getFeaturedDisplayTitle(advertisement)}
                            </div>
                            <div className="text-xs text-default-500">
                              {advertisement.targetMode === 'article'
                                ? advertisement.docPost
                                  ? `/doc/${advertisement.docPost.slug}`
                                  : '关联文章已失效'
                                : '后台独立图文广告'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            advertisement.targetMode === 'external'
                              ? 'secondary'
                              : 'primary'
                          }
                        >
                          {getFeaturedTargetModeLabel(advertisement.targetMode)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            advertisement.visibleForGuest
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {advertisement.visibleForGuest ? '是' : '否'}
                        </Chip>
                      </TableCell>
                      <TableCell>{advertisement.sortOrder}</TableCell>
                      <TableCell>
                        <a
                          href={previewLink}
                          target={
                            isExternalLink(previewLink) ? '_blank' : undefined
                          }
                          rel={
                            isExternalLink(previewLink)
                              ? 'noopener noreferrer'
                              : undefined
                          }
                          className="break-all text-sm text-primary hover:underline"
                        >
                          {previewLink}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              handleOpenEditFeatured(advertisement)
                            }
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            as={Link}
                            href={previewLink}
                            target={
                              isExternalLink(previewLink) ? '_blank' : undefined
                            }
                            isIconOnly
                            size="sm"
                            variant="light"
                          >
                            <ExternalLink size={16} />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            isLoading={deletingId === advertisement.id}
                            onPress={() => handleOpenDelete(advertisement)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                }}
              </TableBody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      <Modal
        isOpen={homeModalOpen}
        onOpenChange={setHomeModalOpen}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            {editingHomeAd ? '编辑首页广告' : `配置广告位 ${homeForm.slot}`}
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              type="number"
              label="广告位"
              labelPlacement="outside"
              description="对应首页广告区中的固定位置，范围 1 到 4。"
              value={String(homeForm.slot)}
              onChange={(event) =>
                setHomeForm((current) => ({
                  ...current,
                  slot: Number(event.target.value) || 1
                }))
              }
            />
            <Input
              label="封面图"
              labelPlacement="outside"
              placeholder="https://example.com/ad.jpg"
              value={homeForm.banner}
              onChange={(event) =>
                setHomeForm((current) => ({
                  ...current,
                  banner: event.target.value
                }))
              }
            />
            <Input
              label="跳转链接"
              labelPlacement="outside"
              placeholder="https://example.com"
              description="广告点击后会直接跳转到这里，不经过等待页。"
              value={homeForm.link}
              onChange={(event) =>
                setHomeForm((current) => ({
                  ...current,
                  link: event.target.value
                }))
              }
            />
            <Switch
              isSelected={homeForm.visibleForGuest}
              onValueChange={(value) =>
                setHomeForm((current) => ({
                  ...current,
                  visibleForGuest: value
                }))
              }
            >
              未登录可见
            </Switch>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setHomeModalOpen(false)}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={() => void submitHomeBox()}
              isLoading={submitting}
              isDisabled={submitting}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={redirectModalOpen}
        onOpenChange={setRedirectModalOpen}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            {editingRedirectAd ? '编辑跳转页广告' : '新建跳转页广告'}
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Input
              label="封面图"
              labelPlacement="outside"
              placeholder="https://example.com/ad.jpg"
              value={redirectForm.banner}
              onChange={(event) =>
                setRedirectForm((current) => ({
                  ...current,
                  banner: event.target.value
                }))
              }
            />
            <Input
              label="跳转链接"
              labelPlacement="outside"
              placeholder="https://example.com"
              description="广告点击后会直接跳转到这里，不经过等待页。"
              value={redirectForm.link}
              onChange={(event) =>
                setRedirectForm((current) => ({
                  ...current,
                  link: event.target.value
                }))
              }
            />
            <Input
              type="number"
              label="排序值"
              labelPlacement="outside"
              description="排序值越大越靠前，跳转页只显示当前可见且排序最高的一条广告。"
              value={String(redirectForm.sortOrder)}
              onChange={(event) =>
                setRedirectForm((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value) || 0
                }))
              }
            />
            <Switch
              isSelected={redirectForm.visibleForGuest}
              onValueChange={(value) =>
                setRedirectForm((current) => ({
                  ...current,
                  visibleForGuest: value
                }))
              }
            >
              未登录可见
            </Switch>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setRedirectModalOpen(false)}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={() => void submitRedirectBox()}
              isLoading={submitting}
              isDisabled={submitting}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={featuredModalOpen}
        onOpenChange={setFeaturedModalOpen}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            {editingFeaturedAd ? '编辑置顶文章广告' : '新建置顶文章广告'}
          </ModalHeader>
          <ModalBody className="space-y-4">
            <Select
              label="点击跳转"
              labelPlacement="outside"
              selectedKeys={new Set([featuredForm.targetMode])}
              onChange={(event) =>
                setFeaturedForm((current) => ({
                  ...current,
                  targetMode:
                    (event.target.value as FeaturedAdvertisementTargetMode) ||
                    'article'
                }))
              }
              description={
                targetModeOptions.find(
                  (option) => option.key === featuredForm.targetMode
                )?.description
              }
            >
              {targetModeOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            {featuredForm.targetMode === 'article' ? (
              <Select
                label="广告文章"
                labelPlacement="outside"
                selectedKeys={
                  featuredForm.docPostId
                    ? new Set([String(featuredForm.docPostId)])
                    : new Set([])
                }
                onChange={(event) =>
                  setFeaturedForm((current) => ({
                    ...current,
                    docPostId: Number(event.target.value) || 0
                  }))
                }
              >
                {docCandidates.map((doc) => (
                  <SelectItem key={String(doc.id)}>{doc.title}</SelectItem>
                ))}
              </Select>
            ) : (
              <>
                <Input
                  label="广告标题"
                  labelPlacement="outside"
                  placeholder="请输入广告标题"
                  value={featuredForm.title}
                  onChange={(event) =>
                    setFeaturedForm((current) => ({
                      ...current,
                      title: event.target.value
                    }))
                  }
                />
                <Input
                  label="封面图"
                  labelPlacement="outside"
                  placeholder="https://example.com/ad.jpg"
                  value={featuredForm.banner}
                  onChange={(event) =>
                    setFeaturedForm((current) => ({
                      ...current,
                      banner: event.target.value
                    }))
                  }
                />
                <Input
                  label="跳转链接"
                  labelPlacement="outside"
                  placeholder="https://example.com"
                  value={featuredForm.link}
                  onChange={(event) =>
                    setFeaturedForm((current) => ({
                      ...current,
                      link: event.target.value
                    }))
                  }
                />
              </>
            )}

            <Input
              type="number"
              label="排序值"
              labelPlacement="outside"
              description="排序值越大越靠前。"
              value={String(featuredForm.sortOrder)}
              onChange={(event) =>
                setFeaturedForm((current) => ({
                  ...current,
                  sortOrder: Number(event.target.value) || 0
                }))
              }
            />
            <Switch
              isSelected={featuredForm.visibleForGuest}
              onValueChange={(value) =>
                setFeaturedForm((current) => ({
                  ...current,
                  visibleForGuest: value
                }))
              }
            >
              未登录可见
            </Switch>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setFeaturedModalOpen(false)}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={() => void submitFeatured()}
              isLoading={submitting}
              isDisabled={submitting}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDelete()
          }
        }}
        placement="center"
      >
        <ModalContent className="max-w-xl">
          <ModalHeader>{deleteTitle}</ModalHeader>
          <ModalBody>
            <p className="whitespace-pre-wrap break-words text-default-700">
              {deleteDescription}
            </p>
            {deleteSummary ? (
              <p className="break-all whitespace-pre-wrap rounded-lg border border-divider bg-default-50 px-4 py-3 text-sm text-default-600">
                {deleteSummary}
              </p>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleCloseDelete}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={() => void handleDelete()}
              isLoading={Boolean(deletingId)}
              isDisabled={Boolean(deletingId)}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
