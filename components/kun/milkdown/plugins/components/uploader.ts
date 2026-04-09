import { Decoration } from '@milkdown/prose/view'
import toast from 'react-hot-toast'
import type { Uploader } from '@milkdown/plugin-upload'

export const kunUploader: Uploader = async () => {
  toast.error('站内已关闭图片上传，请直接粘贴图片链接')
  return []
}

export const kunUploadWidgetFactory = (
  pos: number,
  spec: Parameters<typeof Decoration.widget>[2]
) => {
  const widgetDOM = document.createElement('span')
  widgetDOM.textContent = '本站已关闭图片上传，请改用图片直链'
  widgetDOM.style.color = '#006fee'
  return Decoration.widget(pos, widgetDOM, spec)
}
