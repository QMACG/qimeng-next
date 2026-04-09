'use client'

import { Input } from '@heroui/input'
import { useCreatePatchStore } from '~/store/editStore'

interface Props {
  errors: string | undefined
}

export const BannerImage = ({ errors }: Props) => {
  const { data, setData } = useCreatePatchStore()

  return (
    <div className="space-y-2">
      <h2 className="text-xl">封面图片链接</h2>
      <Input
        isRequired
        label="封面 URL"
        labelPlacement="outside"
        placeholder="填写游戏封面的图片直链"
        value={data.banner}
        isInvalid={!!errors}
        errorMessage={errors}
        onChange={(e) => setData({ ...data, banner: e.target.value })}
      />
    </div>
  )
}
