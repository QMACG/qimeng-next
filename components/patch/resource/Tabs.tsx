'use client'

import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tab,
  Tabs
} from '@heroui/react'
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react'
import { KunNull } from '~/components/kun/Null'
import {
  RESOURCE_SECTION_MAP,
  SUPPORTED_RESOURCE_SECTION
} from '~/constants/resource'
import type { PatchResource } from '~/types/api/patch'
import { ResourceDownload } from './ResourceDownload'
import { ResourceInfo } from './ResourceInfo'

interface Props {
  resources: PatchResource[]
  canManage: boolean
  setEditResource: (resources: PatchResource) => void
  onOpenEdit: () => void
  onOpenDelete: () => void
  setDeleteResourceId: (resourceId: number) => void
}

export const ResourceTabs = ({
  resources,
  canManage,
  setEditResource,
  onOpenEdit,
  onOpenDelete,
  setDeleteResourceId
}: Props) => {
  const renderResourceCard = (resource: PatchResource) => (
    <div
      key={resource.id}
      className="rounded-2xl border border-default-200 p-3"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <ResourceInfo resource={resource} />

          {canManage && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="light" isIconOnly>
                  <MoreHorizontal aria-label="资源操作" className="size-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="资源操作菜单">
                <DropdownItem
                  key="edit"
                  startContent={<Edit className="size-4" />}
                  onPress={() => {
                    setEditResource(resource)
                    onOpenEdit()
                  }}
                >
                  编辑
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Trash2 className="size-4" />}
                  onPress={() => {
                    setDeleteResourceId(resource.id)
                    onOpenDelete()
                  }}
                >
                  删除
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>

        <ResourceDownload resource={resource} />
      </div>
    </div>
  )

  return (
    <Tabs className="mb-4">
      {SUPPORTED_RESOURCE_SECTION.map((section) => {
        const sectionResources = resources.filter(
          (resource) => resource.section === section
        )

        return (
          <Tab
            key={section}
            title={RESOURCE_SECTION_MAP[section]}
            className="w-full"
          >
            <Card>
              <CardBody className="space-y-3">
                {sectionResources.length > 0 ? (
                  sectionResources.map((resource) =>
                    renderResourceCard(resource)
                  )
                ) : (
                  <KunNull message={`暂无${RESOURCE_SECTION_MAP[section]}`} />
                )}
              </CardBody>
            </Card>
          </Tab>
        )
      })}
    </Tabs>
  )
}
