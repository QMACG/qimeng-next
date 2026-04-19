'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/modal'
import { Button } from '@heroui/button'
import { BellRing } from 'lucide-react'
import { PublishedMarkdownPreview } from '~/components/kun/markdown/PublishedMarkdownPreview'
import type { AdminHomeAnnouncementConfig } from '~/types/api/admin'

interface Props {
  announcement: AdminHomeAnnouncementConfig | null
}

const STORAGE_KEY = 'kun-home-announcement:last-seen'

const getTodayKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const HomeAnnouncementModal = ({ announcement }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const version = useMemo(() => {
    if (!announcement) {
      return ''
    }

    return new Date(announcement.updatedAt).toISOString()
  }, [announcement])

  useEffect(() => {
    if (
      !announcement ||
      !announcement.isEnabled ||
      !announcement.content.trim() ||
      !version
    ) {
      return
    }

    const today = getTodayKey()
    const lastSeen = window.localStorage.getItem(STORAGE_KEY)

    if (lastSeen === `${version}:${today}`) {
      return
    }

    setIsOpen(true)
  }, [announcement, version])

  if (
    !announcement ||
    !announcement.isEnabled ||
    !announcement.content.trim() ||
    !version
  ) {
    return null
  }

  const handleClose = () => {
    window.localStorage.setItem(STORAGE_KEY, `${version}:${getTodayKey()}`)
    setIsOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="3xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="border-b border-default-200/70 bg-gradient-to-r from-primary-50 via-background to-secondary-50">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BellRing className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-primary/70">
                Home Notice
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {announcement.title.trim() || '站点公告'}
              </h2>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="py-5">
          <PublishedMarkdownPreview
            markdown={announcement.content}
            embedded
            openLinksInNewTab
          />
        </ModalBody>

        <ModalFooter className="border-t border-default-200/70">
          <Button variant="flat" onPress={handleClose}>
            今天先不再显示
          </Button>
          <Button color="primary" onPress={handleClose}>
            我知道了
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
