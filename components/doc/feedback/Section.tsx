import { Card, CardBody, CardHeader } from '@heroui/card'
import { MessageCircleQuestion } from 'lucide-react'
import { FeedbackComments } from './Comments'

interface Props {
  docPostId: number
  requireCaptcha: boolean
}

export const FeedbackCommentSection = ({
  docPostId,
  requireCaptcha
}: Props) => {
  return (
    <Card className="mt-8 border border-default-200">
      <CardHeader className="flex items-center gap-3 p-4">
        <MessageCircleQuestion className="size-5 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">反馈评论</h2>
          <p className="text-sm text-default-500">
            下载、解压、文件异常等问题，都可以在这里集中反馈。
          </p>
        </div>
      </CardHeader>
      <CardBody className="p-4">
        <FeedbackComments
          docPostId={docPostId}
          requireCaptcha={requireCaptcha}
        />
      </CardBody>
    </Card>
  )
}
