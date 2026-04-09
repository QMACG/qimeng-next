import { Card, CardBody, CardHeader } from '@heroui/card'
import { Resources } from '~/components/patch/resource/Resource'

interface Props {
  id: number
}

export const ResourceTab = ({ id }: Props) => {
  return (
    <Card className="p-1 sm:p-8">
      <CardHeader className="p-4">
        <h2 className="text-2xl font-medium">游戏资源</h2>
      </CardHeader>
      <CardBody className="space-y-4 p-4">
        <Resources id={Number(id)} />
      </CardBody>
    </Card>
  )
}
