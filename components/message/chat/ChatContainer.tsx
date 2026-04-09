'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { KunAvatar } from '~/components/kun/floating-card/KunAvatar'
import { KunNull } from '~/components/kun/Null'
import { useUserStore } from '~/store/userStore'
import { kunFetchGet, kunFetchPut } from '~/utils/kunFetch'
import type { PrivateMessage } from '~/types/api/conversation'
import { ChatInput } from './ChatInput'
import { ChatMessage } from './ChatMessage'
import { DeleteConversationButton } from './DeleteConversationButton'

type MessageUpdateData =
  | { action: 'delete' }
  | { action: 'edit'; content: string; editedAt: string | Date }

interface Props {
  conversationId: number
  initialMessages: PrivateMessage[]
  total: number
  otherUser: KunUser
}

const sortMessagesByTime = (msgs: PrivateMessage[]) => {
  return [...msgs].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
  )
}

export const ChatContainer = ({
  conversationId,
  initialMessages,
  total,
  otherUser
}: Props) => {
  const [messages, setMessages] = useState<PrivateMessage[]>(
    sortMessagesByTime(initialMessages)
  )
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialMessages.length < total)
  const [page, setPage] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)
  const user = useUserStore((state) => state.user)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore) {
      return
    }

    setLoading(true)
    const nextPage = page + 1

    const response = await kunFetchGet<
      KunResponse<{
        messages: PrivateMessage[]
        total: number
        otherUser: KunUser
      }>
    >(`/message/conversation/${conversationId}`, {
      page: nextPage,
      limit: 30
    })

    if (typeof response === 'string') {
      toast.error(response)
    } else {
      const scrollContainer = scrollContainerRef.current
      const previousScrollHeight = scrollContainer?.scrollHeight || 0

      setMessages((prev) => sortMessagesByTime([...response.messages, ...prev]))
      setPage(nextPage)
      setHasMore(nextPage * 30 < response.total)

      requestAnimationFrame(() => {
        if (scrollContainer) {
          const newScrollHeight = scrollContainer.scrollHeight
          scrollContainer.scrollTop = newScrollHeight - previousScrollHeight
        }
      })
    }

    setLoading(false)
  }, [conversationId, hasMore, loading, page])

  const handleMessageSent = useCallback(
    (newMessage: { id: number; content: string; created: string }) => {
      const message: PrivateMessage = {
        id: newMessage.id,
        content: newMessage.content,
        status: 0,
        isDeleted: false,
        editedAt: null,
        created: newMessage.created,
        sender: {
          id: user.uid,
          name: user.name,
          avatar: user.avatar
        }
      }

      setMessages((prev) => sortMessagesByTime([...prev, message]))
      requestAnimationFrame(() => {
        scrollToBottom()
      })
    },
    [scrollToBottom, user]
  )

  const handleMessageUpdated = useCallback(
    (messageId: number, data: MessageUpdateData) => {
      if (data.action === 'delete') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isDeleted: true } : msg
          )
        )
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: data.content, editedAt: data.editedAt }
              : msg
          )
        )
      }
    },
    []
  )

  useEffect(() => {
    const markAsRead = async () => {
      await kunFetchPut(`/message/conversation/${conversationId}/read`)
    }

    markAsRead()
  }, [conversationId])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      scrollToBottom()
    }
  }, [scrollToBottom])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreMessages()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadMoreMessages, loading])

  return (
    <Card className="h-[calc(100vh-200px)] min-h-[500px]">
      <CardHeader className="flex items-center justify-between gap-3 border-b border-default-200">
        <div className="flex items-center gap-3">
          <Button
            as={Link}
            href="/message/chat"
            variant="light"
            isIconOnly
            size="sm"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <KunAvatar
            uid={otherUser.id}
            avatarProps={{
              src: otherUser.avatar,
              name: otherUser.name,
              size: 'sm'
            }}
          />

          <span className="font-semibold">{otherUser.name}</span>
        </div>

        <DeleteConversationButton
          conversationId={conversationId}
          otherUserName={otherUser.name}
        />
      </CardHeader>

      <CardBody className="flex flex-col p-0">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-2">
              {loading && (
                <Loader2 className="size-5 animate-spin text-default-400" />
              )}
            </div>
          )}

          {messages.length === 0 ? (
            <KunNull message="暂无消息，发出第一条私聊吧" />
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender.id === user.uid}
                  conversationId={conversationId}
                  onMessageUpdated={(data) =>
                    handleMessageUpdated(msg.id, data)
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="border-t border-default-200 p-4">
          <ChatInput
            conversationId={conversationId}
            onMessageSent={handleMessageSent}
          />
        </div>
      </CardBody>
    </Card>
  )
}
