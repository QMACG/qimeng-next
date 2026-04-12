'use client'

import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode
} from 'react'
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  Textarea
} from '@heroui/react'
import {
  AlertTriangle,
  Bold,
  Code,
  Code2,
  Columns3,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Images,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  MousePointerClick,
  Quote,
  Strikethrough,
  Table2,
  Video
} from 'lucide-react'
import { MenuButton } from '../plugins/MenuButton'
import type { CodemirrorAPI } from './Codemirror'

interface Props {
  api: CodemirrorAPI | null
}

interface ToolProps {
  api: CodemirrorAPI | null
}

const buttonTypeOptions = [
  { key: 'yellow', label: '黄色实心' },
  { key: 'blue', label: '蓝色实心' },
  { key: 'green', label: '绿色实心' },
  { key: 'red', label: '红色实心' },
  { key: 'purple', label: '紫色实心' },
  { key: 'gray', label: '灰色实心' },
  { key: 'black', label: '黑色实心' },
  { key: 'white', label: '白色实心' },
  { key: 'outline-yellow', label: '黄色描边' },
  { key: 'outline-blue', label: '蓝色描边' },
  { key: 'outline-green', label: '绿色描边' },
  { key: 'outline-red', label: '红色描边' }
] as const

const calloutTypeOptions = [
  { key: 'info', label: '信息提示' },
  { key: 'warning', label: '警告提醒' },
  { key: 'success', label: '成功提示' },
  { key: 'danger', label: '危险提醒' },
  { key: 'note', label: '备注说明' }
] as const

const tableTemplateOptions = [
  {
    key: 'basic',
    label: '基础表格',
    content: `| 字段 | 内容 | 备注 |
| --- | --- | --- |
| 示例 1 | 示例内容 | 可自行修改 |
| 示例 2 | 示例内容 | 可自行修改 |`
  },
  {
    key: 'compare',
    label: '对比表格',
    content: `| 项目 | 版本 A | 版本 B | 说明 |
| --- | --- | --- | --- |
| 画质 | 高清 | 超清 | 根据实际填写 |
| 语音 | 有 | 无 | 根据实际填写 |
| 附加内容 | 标准版 | 豪华版 | 根据实际填写 |`
  },
  {
    key: 'resource',
    label: '资源信息表',
    content: `| 资源线路 | 链接说明 | 状态 | 备注 |
| --- | --- | --- | --- |
| 线路一 | 请填写说明 | 可用 | 可自行修改 |
| 线路二 | 请填写说明 | 可用 | 可自行修改 |`
  }
] as const

const TooltipTriggerButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Button> & {
    tooltip: string
    ariaLabel: string
    children: ReactNode
  }
>(({ tooltip, ariaLabel, children, ...buttonProps }, ref) => (
  <Button
    ref={ref}
    isIconOnly
    variant="light"
    type="button"
    title={tooltip}
    aria-label={ariaLabel}
    {...buttonProps}
  >
    {children}
  </Button>
))

TooltipTriggerButton.displayName = 'TooltipTriggerButton'

const LinkInsertButton = ({ api }: ToolProps) => {
  const [link, setLink] = useState('')
  const [text, setText] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleInsert = () => {
    if (!api) {
      return
    }

    api.insertLink(text, link)
    setText('')
    setLink('')
    setIsOpen(false)
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <TooltipTriggerButton tooltip="插入链接" ariaLabel="插入链接">
          <Link2 className="size-5" />
        </TooltipTriggerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[280px]">
        <div className="w-full px-1 py-2">
          <p className="text-small font-bold">插入链接</p>
          <div className="mt-2 flex flex-col gap-2">
            <Input
              value={text}
              onChange={(event) => setText(event.target.value)}
              label="链接文本"
              placeholder="显示文字"
              size="sm"
              variant="bordered"
            />
            <Input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              label="链接地址"
              placeholder="https://example.com"
              size="sm"
              variant="bordered"
            />
          </div>
          <Button
            className="mt-2 w-full"
            color="primary"
            variant="flat"
            type="button"
            onPress={handleInsert}
            isDisabled={!link.trim()}
          >
            确认插入
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const ImageInsertButton = ({ api }: ToolProps) => {
  const [src, setSrc] = useState('')
  const [alt, setAlt] = useState('')
  const [title, setTitle] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleInsert = () => {
    if (!api) {
      return
    }

    api.insertImage(alt, src, title)
    setSrc('')
    setAlt('')
    setTitle('')
    setIsOpen(false)
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <TooltipTriggerButton tooltip="插入图片" ariaLabel="插入图片">
          <Image className="size-5" />
        </TooltipTriggerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        <div className="w-full px-1 py-2">
          <p className="text-small font-bold">插入图片</p>
          <div className="mt-2 flex flex-col gap-2">
            <Input
              value={src}
              onChange={(event) => setSrc(event.target.value)}
              label="图片地址"
              placeholder="https://example.com/image.avif"
              size="sm"
              variant="bordered"
            />
            <Input
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              label="替代文本"
              placeholder="图片说明"
              size="sm"
              variant="bordered"
            />
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              label="标题"
              placeholder="可选"
              size="sm"
              variant="bordered"
            />
          </div>
          <Button
            className="mt-2 w-full"
            color="primary"
            variant="flat"
            type="button"
            onPress={handleInsert}
            isDisabled={!src.trim()}
          >
            确认插入
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const ButtonDirectiveInsertButton = ({ api }: ToolProps) => {
  const [href, setHref] = useState('')
  const [text, setText] = useState('')
  const [type, setType] = useState('yellow')
  const [isOpen, setIsOpen] = useState(false)

  const handleInsert = () => {
    if (!api) {
      return
    }

    api.insertButton(text, href, type)
    setHref('')
    setText('')
    setType('yellow')
    setIsOpen(false)
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <TooltipTriggerButton tooltip="插入按钮" ariaLabel="插入按钮">
          <MousePointerClick className="size-5" />
        </TooltipTriggerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        <div className="w-full px-1 py-2">
          <p className="text-small font-bold">插入按钮</p>
          <div className="mt-2 flex flex-col gap-2">
            <Input
              value={text}
              onChange={(event) => setText(event.target.value)}
              label="按钮文字"
              placeholder="立即下载"
              size="sm"
              variant="bordered"
            />
            <Input
              value={href}
              onChange={(event) => setHref(event.target.value)}
              label="跳转地址"
              placeholder="https://example.com"
              size="sm"
              variant="bordered"
            />
            <Select
              label="按钮样式"
              selectedKeys={new Set([type])}
              onChange={(event) => setType(event.target.value)}
              size="sm"
              variant="bordered"
            >
              {buttonTypeOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>
          <Button
            className="mt-2 w-full"
            color="primary"
            variant="flat"
            type="button"
            onPress={handleInsert}
            isDisabled={!href.trim()}
          >
            确认插入
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const CalloutInsertButton = ({ api }: ToolProps) => {
  const [type, setType] = useState('warning')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleInsert = () => {
    if (!api) {
      return
    }

    api.insertCallout({
      type,
      title,
      content
    })
    setType('warning')
    setTitle('')
    setContent('')
    setIsOpen(false)
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <TooltipTriggerButton tooltip="插入提示框" ariaLabel="插入提示框">
          <AlertTriangle className="size-5" />
        </TooltipTriggerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[360px]">
        <div className="w-full px-1 py-2">
          <p className="text-small font-bold">插入提示框</p>
          <div className="mt-2 flex flex-col gap-2">
            <Select
              label="提示框类型"
              selectedKeys={new Set([type])}
              onChange={(event) => setType(event.target.value)}
              size="sm"
              variant="bordered"
            >
              {calloutTypeOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              label="标题"
              placeholder="例如：下载前请先阅读"
              size="sm"
              variant="bordered"
            />
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              label="内容"
              placeholder="这里填写提示内容"
              minRows={4}
              variant="bordered"
            />
          </div>
          <Button
            className="mt-2 w-full"
            color="primary"
            variant="flat"
            type="button"
            onPress={handleInsert}
          >
            确认插入
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const GalleryInsertButton = ({ api }: ToolProps) => {
  const [galleryInput, setGalleryInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleInsert = () => {
    if (!api) {
      return
    }

    api.insertGallery(galleryInput)
    setGalleryInput('')
    setIsOpen(false)
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <TooltipTriggerButton tooltip="插入画廊" ariaLabel="插入画廊">
          <Images className="size-5" />
        </TooltipTriggerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[380px]">
        <div className="w-full px-1 py-2">
          <p className="text-small font-bold">插入图片画廊模板</p>
          <div className="mt-2 flex flex-col gap-2">
            <Textarea
              value={galleryInput}
              onChange={(event) => setGalleryInput(event.target.value)}
              label="图片链接列表"
              placeholder={
                '每行一个图片链接，支持直接粘贴多行。\nhttps://example.com/1.avif\nhttps://example.com/2.avif'
              }
              minRows={5}
              variant="bordered"
            />
          </div>
          <Button
            className="mt-2 w-full"
            color="primary"
            variant="flat"
            type="button"
            onPress={handleInsert}
          >
            确认插入
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const TableTemplateInsertButton = ({ api }: ToolProps) => {
  const [template, setTemplate] = useState<string>(tableTemplateOptions[0].key)
  const [isOpen, setIsOpen] = useState(false)

  const handleInsert = () => {
    if (!api) {
      return
    }

    const selectedTemplate =
      tableTemplateOptions.find((item) => item.key === template) ??
      tableTemplateOptions[0]

    api.insertTableTemplate(selectedTemplate.content)
    setIsOpen(false)
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <TooltipTriggerButton tooltip="插入表格模板" ariaLabel="插入表格模板">
          <Columns3 className="size-5" />
        </TooltipTriggerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[320px]">
        <div className="w-full px-1 py-2">
          <p className="text-small font-bold">插入表格模板</p>
          <div className="mt-2 flex flex-col gap-2">
            <Select
              label="表格模板"
              selectedKeys={new Set([template])}
              onChange={(event) => setTemplate(event.target.value)}
              size="sm"
              variant="bordered"
            >
              {tableTemplateOptions.map((option) => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>
          </div>
          <Button
            className="mt-2 w-full"
            color="primary"
            variant="flat"
            type="button"
            onPress={handleInsert}
          >
            确认插入
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

const VideoInsertButton = ({ api }: ToolProps) => {
  const [link, setLink] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleInsert = () => {
    if (!api || !link.trim()) {
      return
    }

    api.insertVideo(link)
    setLink('')
    setIsOpen(false)
  }

  return (
    <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="bottom">
      <PopoverTrigger>
        <TooltipTriggerButton tooltip="插入视频" ariaLabel="插入视频">
          <Video className="size-5" />
        </TooltipTriggerButton>
      </PopoverTrigger>
      <PopoverContent className="w-[240px]">
        <div className="w-full px-1 py-2">
          <p className="text-small font-bold">插入视频</p>
          <div className="mt-2">
            <Input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              label="视频地址"
              placeholder="https://example.com/video.mp4"
              size="sm"
              variant="bordered"
            />
          </div>
          <Button
            className="mt-2 w-full"
            color="primary"
            variant="flat"
            type="button"
            onPress={handleInsert}
            isDisabled={!link.trim()}
          >
            确认插入
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const MarkdownToolbar = ({ api }: Props) => {
  return (
    <div className="flex flex-wrap gap-1 rounded-large border border-default-200 bg-content1/60 p-2">
      <MenuButton
        tooltip="一级标题"
        icon={Heading1}
        onPress={() => api?.toggleHeading(1)}
        ariaLabel="一级标题"
      />
      <MenuButton
        tooltip="二级标题"
        icon={Heading2}
        onPress={() => api?.toggleHeading(2)}
        ariaLabel="二级标题"
      />
      <MenuButton
        tooltip="三级标题"
        icon={Heading3}
        onPress={() => api?.toggleHeading(3)}
        ariaLabel="三级标题"
      />
      <MenuButton
        tooltip="加粗"
        icon={Bold}
        onPress={() => api?.surroundSelection('**')}
        ariaLabel="加粗"
      />
      <MenuButton
        tooltip="斜体"
        icon={Italic}
        onPress={() => api?.surroundSelection('*')}
        ariaLabel="斜体"
      />
      <MenuButton
        tooltip="删除线"
        icon={Strikethrough}
        onPress={() => api?.surroundSelection('~~')}
        ariaLabel="删除线"
      />
      <MenuButton
        tooltip="行内代码"
        icon={Code}
        onPress={() => api?.surroundSelection('`')}
        ariaLabel="行内代码"
      />
      <MenuButton
        tooltip="代码块"
        icon={Code2}
        onPress={() => api?.insertCodeBlock()}
        ariaLabel="代码块"
      />
      <MenuButton
        tooltip="无序列表"
        icon={List}
        onPress={() => api?.toggleBulletList()}
        ariaLabel="无序列表"
      />
      <MenuButton
        tooltip="有序列表"
        icon={ListOrdered}
        onPress={() => api?.toggleOrderedList()}
        ariaLabel="有序列表"
      />
      <MenuButton
        tooltip="引用"
        icon={Quote}
        onPress={() => api?.toggleBlockquote()}
        ariaLabel="引用"
      />
      <MenuButton
        tooltip="分隔线"
        icon={Minus}
        onPress={() => api?.insertHorizontalRule()}
        ariaLabel="分隔线"
      />
      <MenuButton
        tooltip="基础表格"
        icon={Table2}
        onPress={() => api?.insertTable()}
        ariaLabel="基础表格"
      />

      <LinkInsertButton api={api} />
      <ImageInsertButton api={api} />
      <ButtonDirectiveInsertButton api={api} />
      <CalloutInsertButton api={api} />
      <GalleryInsertButton api={api} />
      <TableTemplateInsertButton api={api} />
      <VideoInsertButton api={api} />
    </div>
  )
}
