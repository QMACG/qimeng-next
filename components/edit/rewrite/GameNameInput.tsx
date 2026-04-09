import { Input } from '@heroui/input'

interface Props {
  name: string
  onChange: (newName: string) => void
  error?: string
}

export const GameNameInput = ({ name, onChange, error }: Props) => (
  <div className="space-y-2">
    <h2 className="text-xl">游戏名称（必填）</h2>
    <Input
      isRequired
      className="mb-4"
      variant="underlined"
      labelPlacement="outside"
      placeholder="输入游戏名称，作为文章标题展示"
      value={name}
      onChange={(event) => onChange(event.target.value)}
      isInvalid={!!error}
      errorMessage={error}
    />
  </div>
)
