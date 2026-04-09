'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  useDisclosure
} from '@heroui/react'
import * as QRCode from 'qrcode'
import { Totp } from 'time2fa'
import toast from 'react-hot-toast'
import { kunMoyuMoe } from '~/config/moyu-moe'
import { useMounted } from '~/hooks/useMounted'
import { useUserStore } from '~/store/userStore'
import { kunFetchGet, kunFetchPost } from '~/utils/kunFetch'
import { kunErrorHandler } from '~/utils/kunErrorHandler'

interface AuthStatus {
  isEnabled2FA: boolean
  hasSecret: boolean
  backupCodeLength: number
  secret: string
  authUrl: string
  qrCodeUrl: string
  token: string
  backupCode: string[]
}

const initialStatus: AuthStatus = {
  isEnabled2FA: false,
  hasSecret: false,
  backupCodeLength: 0,
  secret: '',
  authUrl: '',
  qrCodeUrl: '',
  token: '',
  backupCode: []
}

export const TwoFactorAuth = () => {
  const user = useUserStore((state) => state.user)
  const isMounted = useMounted()
  const [isPending, startTransition] = useTransition()
  const [authStatus, setAuthStatus] = useState<AuthStatus>(initialStatus)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isBackupOpen,
    onOpen: onBackupOpen,
    onClose: onBackupClose
  } = useDisclosure()

  useEffect(() => {
    const check2FAStatus = async () => {
      const response = await kunFetchGet<{
        enabled: boolean
        hasSecret: boolean
        backupCodeLength: number
      }>('/user/setting/2fa/status')

      setAuthStatus((prev) => ({
        ...prev,
        isEnabled2FA: response.enabled,
        hasSecret: response.hasSecret,
        backupCodeLength: response.backupCodeLength
      }))
    }

    if (isMounted) {
      check2FAStatus()
    }
  }, [isMounted])

  useEffect(() => {
    if (!authStatus.authUrl) {
      return
    }

    QRCode.toDataURL(authStatus.authUrl)
      .then((url) => {
        setAuthStatus((prev) => ({ ...prev, qrCodeUrl: url }))
      })
      .catch((err) => {
        throw err
      })
  }, [authStatus.authUrl])

  const generateSecret = async () => {
    if (!user.uid) {
      toast.error('请登录后再启用两步验证')
      return
    }

    startTransition(async () => {
      const key = Totp.generateKey({
        issuer: kunMoyuMoe.titleShort,
        user: user.name || user.uid.toString()
      })

      const res = await kunFetchPost<KunResponse<{}>>(
        '/user/setting/2fa/save-secret',
        { secret: key.secret }
      )

      kunErrorHandler(res, () => {
        setAuthStatus((prev) => ({
          ...prev,
          secret: key.secret,
          authUrl: key.url,
          hasSecret: true,
          token: ''
        }))
        onOpen()
        toast.success('密钥已生成，请使用身份验证器扫描二维码')
      })
    })
  }

  const verifyAndEnable = async () => {
    if (!authStatus.token) {
      toast.error('请输入验证码')
      return
    }

    startTransition(async () => {
      const isValid = Totp.validate({
        passcode: authStatus.token,
        secret: authStatus.secret
      })

      if (!isValid) {
        toast.error('验证码无效，请重新输入')
        return
      }

      const res = await kunFetchPost<KunResponse<{ backupCode: string[] }>>(
        '/user/setting/2fa/enable',
        { token: authStatus.token }
      )

      kunErrorHandler(res, (value) => {
        setAuthStatus((prev) => ({
          ...prev,
          isEnabled2FA: true,
          backupCode: value.backupCode,
          backupCodeLength: value.backupCode.length
        }))
        onClose()
        onBackupOpen()
        toast.success('两步验证已启用')
      })
    })
  }

  const disable2FA = async () => {
    startTransition(async () => {
      const res = await kunFetchPost<KunResponse<{}>>(
        '/user/setting/2fa/disable'
      )

      kunErrorHandler(res, () => {
        setAuthStatus(initialStatus)
        toast.success('两步验证已关闭')
      })
    })
  }

  return (
    <>
      <Card className="w-full text-sm">
        <CardHeader>
          <h2 className="text-xl font-medium">两步验证</h2>
        </CardHeader>

        <CardBody className="space-y-4 py-0">
          <div>
            <p>
              两步验证可以为您的账户增加额外保护。启用后，登录时除了密码，还需要输入身份验证器生成的验证码。
            </p>
            <p>
              当前剩余 <b>{authStatus.backupCodeLength}</b> 个备用验证码。若数量过少，
              建议重新关闭并启用一次两步验证以生成新的备用码。
            </p>
          </div>

          <div className="flex items-center justify-between">
            <p>是否启用两步验证</p>
            <Switch
              size="lg"
              color="primary"
              isSelected={authStatus.isEnabled2FA}
              isDisabled={isPending}
              onValueChange={(value) => {
                if (value) {
                  generateSecret()
                } else {
                  disable2FA()
                }
              }}
            />
          </div>
        </CardBody>

        <CardFooter className="flex-wrap">
          <p className="text-default-500">
            启用后，即使密码泄露，其他人也无法直接登录您的账户。
          </p>
        </CardFooter>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>设置两步验证</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">步骤 1：扫描二维码</h3>
                <p className="text-sm text-default-500">
                  使用 Google Authenticator、Microsoft Authenticator
                  或其他身份验证器应用扫描下方二维码。
                </p>
                {authStatus.qrCodeUrl && (
                  <div className="my-4 flex justify-center">
                    <img
                      src={authStatus.qrCodeUrl}
                      alt="两步验证二维码"
                      width={200}
                      height={200}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">步骤 2：输入验证码</h3>
                <p className="text-sm text-default-500">
                  打开身份验证器应用，输入当前显示的 6 位验证码。
                </p>
                <Input
                  value={authStatus.token}
                  onValueChange={(value) =>
                    setAuthStatus((prev) => ({ ...prev, token: value }))
                  }
                  placeholder="6 位验证码"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">手动密钥</h3>
                <p className="text-sm text-default-500">
                  如果无法扫描二维码，也可以将下方密钥手动输入到身份验证器应用中。
                </p>
                <div className="flex gap-2">
                  <Input value={authStatus.secret} readOnly className="font-mono" />
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={() => {
                      navigator.clipboard.writeText(authStatus.secret)
                      toast.success('密钥已复制到剪贴板')
                    }}
                  >
                    复制
                  </Button>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={verifyAndEnable}
              isLoading={isPending}
              isDisabled={isPending || !authStatus.token}
            >
              验证并启用
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isDismissable={false}
        isOpen={isBackupOpen}
        onClose={onBackupClose}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>备用验证码</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-default-500">
                请妥善保存这些备用验证码。每个验证码只能使用一次，当您无法使用身份验证器时，可以用它们登录。
              </p>
              <div className="grid grid-cols-3 gap-2">
                {authStatus.backupCode.map((code, index) => (
                  <Chip
                    key={index}
                    className="mx-auto p-2 font-mono text-center"
                    variant="flat"
                  >
                    {code}
                  </Chip>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => {
                navigator.clipboard.writeText(authStatus.backupCode.join('\n'))
                toast.success('备用验证码已复制到剪贴板')
              }}
            >
              复制全部
            </Button>
            <Button color="primary" onPress={onBackupClose}>
              完成
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
