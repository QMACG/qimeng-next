'use client'

import { useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure
} from '@heroui/react'
import toast from 'react-hot-toast'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { formatDate } from '~/utils/time'
import { kunFetchPost } from '~/utils/kunFetch'
import type { AdminReport, AdminReportTargetType } from '~/types/api/admin'
import { ReportHandler } from './ReportHandler'

interface Props {
  report: AdminReport
  targetType: AdminReportTargetType
  onHandled: () => void
}

export const ReportCard = ({ report, targetType, onHandled }: Props) => {
  const [reportStatus, setReportStatus] = useState(report.status)
  const [handleContent, setHandleContent] = useState('')
  const [actionType, setActionType] = useState<'delete' | 'reject'>('delete')
  const [updating, setUpdating] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const targetId =
    targetType === 'rating' ? report.reportedRatingId : report.reportedCommentId

  const displayedUid = report.reportedUser?.id ?? report.reportedUserId ?? 0
  const displayedName = report.reportedUser?.name
    ? report.reportedUser.name
    : report.reportedUserId
      ? `用户 #${report.reportedUserId}`
      : '未知被举报用户'
  const displayedAvatar = report.reportedUser?.avatar ?? ''

  const handleUpdateReport = async () => {
    setUpdating(true)

    const res = await kunFetchPost<KunResponse<{}>>('/admin/report/handle', {
      messageId: report.id,
      action: actionType,
      targetType,
      targetId,
      content: handleContent.trim()
    })

    if (typeof res === 'string') {
      toast.error(res)
    } else {
      setReportStatus(actionType === 'reject' ? 3 : 2)
      onClose()
      setHandleContent('')
      toast.success(actionType === 'reject' ? '举报已驳回' : '举报处理成功')
      onHandled()
    }

    setUpdating(false)
  }

  const statusColor: 'success' | 'danger' | 'warning' =
    reportStatus === 0 ? 'danger' : reportStatus === 3 ? 'warning' : 'success'

  const statusLabel =
    reportStatus === 0 ? '未处理' : reportStatus === 3 ? '已驳回' : '已处理'

  return (
    <>
      <Card>
        <CardBody>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              {displayedUid ? (
                <KunAvatar
                  uid={displayedUid}
                  avatarProps={{
                    name: displayedName,
                    src: displayedAvatar
                  }}
                />
              ) : (
                <Avatar
                  name={displayedName.charAt(0).toUpperCase()}
                  className="shrink-0"
                  src={displayedAvatar}
                />
              )}

              <div>
                <div className="flex items-center gap-2">
                  <Chip size="sm" variant="flat">
                    被举报人
                  </Chip>
                  <h2 className="font-semibold">{displayedName}</h2>
                  <span className="text-small text-default-500">
                    {formatDate(report.created, {
                      isPrecise: true,
                      isShowYear: true
                    })}
                  </span>
                </div>

                <p className="mt-1 whitespace-pre-wrap">{report.content}</p>

                <div className="mt-2 flex items-center gap-4">
                  <Chip color={statusColor} variant="flat">
                    {statusLabel}
                  </Chip>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => {
                      setActionType('delete')
                      setHandleContent('')
                      onOpen()
                    }}
                    isDisabled={reportStatus !== 0}
                  >
                    删除内容
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
                    variant="flat"
                    onPress={() => {
                      setActionType('reject')
                      setHandleContent('')
                      onOpen()
                    }}
                    isDisabled={reportStatus !== 0}
                  >
                    驳回举报
                  </Button>
                </div>
              </div>
            </div>

            <ReportHandler initialReport={report} />
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {actionType === 'reject' ? '驳回举报' : '处理举报'}
          </ModalHeader>
          <ModalBody>
            <Textarea
              value={handleContent}
              label="处理说明（可选）"
              onChange={(e) => setHandleContent(e.target.value)}
              placeholder={
                actionType === 'reject'
                  ? '留空则使用默认回复：已驳回举报'
                  : '留空则使用默认回复：已处理举报'
              }
              minRows={2}
              maxRows={8}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setHandleContent('')
                onClose()
              }}
            >
              取消
            </Button>
            <Button
              color={actionType === 'reject' ? 'warning' : 'danger'}
              onPress={handleUpdateReport}
              isLoading={updating}
              isDisabled={updating}
            >
              {actionType === 'reject' ? '确认驳回' : '确认删除'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
