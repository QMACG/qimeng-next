'use client'

import { Button, Card, CardBody, CardFooter, Link } from '@heroui/react'
import { motion } from 'framer-motion'
import { resolveFriendLinkAvatar } from '~/utils/friendLink'
import type { FriendLinkItem } from '~/types/api/friend-link'

interface Props {
  links: FriendLinkItem[]
  enableFriendLinkApply?: boolean
}

export const KunFriendLink = ({
  links,
  enableFriendLinkApply = true
}: Props) => {
  return (
    <div className="container mx-auto my-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-4 text-center text-4xl text-primary-500">友情链接</h1>
        <p className="mb-6 text-center text-default-500">
          这里收录了本站的友情链接，点击卡片即可前往对应站点。
        </p>
        {enableFriendLinkApply ? (
          <div className="mb-12 flex justify-center">
            <Button as={Link} href="/friend-link/apply" color="primary" variant="flat">
              申请友情链接
            </Button>
          </div>
        ) : null}
      </motion.div>

      <div className="grid grid-cols-2 gap-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {links.map((friend, index) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.06 }}
            className="h-full w-full"
          >
            <Card
              isPressable
              isHoverable
              onPress={() => window.open(friend.link, '_blank', 'noopener,noreferrer')}
              className="h-full w-full border border-default-200"
            >
              <CardBody className="overflow-visible p-0">
                <div className="flex w-full justify-center pt-4">
                  <img
                    alt={friend.name}
                    className="h-24 w-24 rounded-lg object-cover"
                    src={resolveFriendLinkAvatar(friend.link, friend.avatar)}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.src = '/favicon.ico'
                    }}
                  />
                </div>
              </CardBody>
              <CardFooter className="flex flex-col items-center pb-6 pt-4">
                <h4 className="font-bold text-large">{friend.name}</h4>
                {friend.description ? (
                  <p className="mt-1 line-clamp-4 text-center text-sm text-default-500">
                    {friend.description}
                  </p>
                ) : null}
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
