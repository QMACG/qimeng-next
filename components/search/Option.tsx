'use client'

import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@heroui/react'
import { Settings } from 'lucide-react'
import { useSearchStore } from '~/store/searchStore'

export const SearchOption = () => {
  const searchData = useSearchStore((state) => state.data)
  const setSearchData = useSearchStore((state) => state.setData)

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button isIconOnly variant="flat" color="primary">
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="w-72 space-y-3 p-3">
          <div className="space-y-1 text-sm text-default-500">
            <p>选择要参与匹配的搜索范围。</p>
            <p>这里的“正文”指游戏详情里的介绍正文，不是站内文章内容。</p>
            <p>可以单独搜索，也可以多项组合搜索。</p>
          </div>

          <div className="flex flex-col flex-wrap gap-3">
            <Checkbox
              isSelected={searchData.searchInTitle}
              onValueChange={(checked) =>
                setSearchData({ ...searchData, searchInTitle: checked })
              }
            >
              包含标题
            </Checkbox>

            <Checkbox
              isSelected={searchData.searchInIntroduction}
              onValueChange={(checked) =>
                setSearchData({ ...searchData, searchInIntroduction: checked })
              }
            >
              包含正文
            </Checkbox>

            <Checkbox
              isSelected={searchData.searchInTag}
              onValueChange={(checked) =>
                setSearchData({ ...searchData, searchInTag: checked })
              }
            >
              包含标签
            </Checkbox>

            <Checkbox
              isSelected={searchData.searchInCompany}
              onValueChange={(checked) =>
                setSearchData({ ...searchData, searchInCompany: checked })
              }
            >
              包含会社
            </Checkbox>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
