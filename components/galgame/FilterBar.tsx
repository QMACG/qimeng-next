'use client'

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/dropdown'
import { Button } from '@heroui/button'
import { Card, CardHeader } from '@heroui/card'
import { ArrowDownAZ, ArrowUpAZ, ChevronDown } from 'lucide-react'
import type { SortField, SortOrder } from './_sort'

interface Props {
  sortField: SortField
  setSortField: (option: SortField) => void
  sortOrder: SortOrder
  setSortOrder: (direction: SortOrder) => void
}

const sortFieldLabelMap: Record<SortField, string> = {
  resource_update_time: '资源更新时间',
  created: '发布时间',
  rating: '评分',
  view: '浏览量',
  download: '下载量',
  favorite: '收藏量'
}

export const FilterBar = ({
  sortField,
  setSortField,
  sortOrder,
  setSortOrder
}: Props) => {
  const currentSortLabel =
    sortFieldLabelMap[sortField] ?? (sortField === 'rating' ? '评分' : '排序')

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex w-full flex-wrap justify-between gap-3 sm:flex-nowrap">
          <div className="flex flex-1 gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="flat"
                  className="w-full justify-between text-sm sm:max-w-xs"
                  endContent={<ChevronDown className="size-4" />}
                >
                  {currentSortLabel}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="排序选项"
                selectedKeys={new Set([sortField])}
                onAction={(key) => setSortField(key as SortField)}
                selectionMode="single"
                className="min-w-[200px]"
              >
                <DropdownItem
                  key="resource_update_time"
                  className="text-default-700"
                >
                  资源更新时间
                </DropdownItem>
                <DropdownItem key="created" className="text-default-700">
                  发布时间
                </DropdownItem>
                <DropdownItem key="rating" className="text-default-700">
                  评分
                </DropdownItem>
                <DropdownItem key="view" className="text-default-700">
                  浏览量
                </DropdownItem>
                <DropdownItem key="download" className="text-default-700">
                  下载量
                </DropdownItem>
                <DropdownItem key="favorite" className="text-default-700">
                  收藏量
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button
              variant="flat"
              className="shrink-0 text-sm"
              onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              startContent={
                sortOrder === 'asc' ? (
                  <ArrowUpAZ className="size-4" />
                ) : (
                  <ArrowDownAZ className="size-4" />
                )
              }
            >
              <span>{sortOrder === 'asc' ? '升序' : '降序'}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
