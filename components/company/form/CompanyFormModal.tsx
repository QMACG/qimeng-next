'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Textarea
} from '@heroui/react'
import type { FC } from 'react'
import { ArrayAdder } from './ArrayAdder'
import { SUPPORTED_LANGUAGE_MAP } from '~/constants/resource'
import type { Company, CompanyDetail } from '~/types/api/company'
import { kunFetchPost, kunFetchPut } from '~/utils/kunFetch'
import { errorReporter, kunErrorHandlerAsync } from '~/utils/kunErrorHandler'
import { createCompanySchema } from '~/validations/company'

const companyFormSchema = createCompanySchema.extend({
  companyId: z.coerce.number().min(1).max(9999999).optional()
})

type CompanyFormData = z.input<typeof companyFormSchema>

interface Props {
  type: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  onSuccess: (company: Company | CompanyDetail) => void
  company?: CompanyDetail
}

const languages = Object.entries(SUPPORTED_LANGUAGE_MAP).map(
  ([key, value]) => ({ key, value })
)

export const CompanyFormModal: FC<Props> = ({
  type,
  isOpen,
  onClose,
  onSuccess,
  company
}) => {
  const isEdit = type === 'edit'

  const [aliasInput, setAliasInput] = useState('')
  const [websiteInput, setWebsiteInput] = useState('')
  const [brandInput, setBrandInput] = useState('')
  const [isSubmitting, startSubmit] = useTransition()

  const formDefaultValue = useMemo((): CompanyFormData => {
    const defaultValue: CompanyFormData = {
      name: isEdit ? (company?.name ?? '') : '',
      introduction: isEdit ? (company?.introduction ?? '') : '',
      alias: isEdit ? (company?.alias ?? []) : [],
      primary_language: isEdit ? (company?.primary_language ?? []) : [],
      official_website: isEdit ? (company?.official_website ?? []) : [],
      parent_brand: isEdit ? (company?.parent_brand ?? []) : []
    }

    if (isEdit && company) {
      defaultValue.companyId = company.id
    }

    return defaultValue
  }, [company, isEdit])

  const {
    register,
    formState: { errors },
    getValues,
    watch,
    setValue,
    reset
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: formDefaultValue
  })

  useEffect(() => {
    if (isEdit && isOpen) {
      reset({
        companyId: company?.id,
        name: company?.name ?? '',
        introduction: company?.introduction ?? '',
        alias: company?.alias ?? [],
        primary_language: company?.primary_language ?? [],
        official_website: company?.official_website ?? [],
        parent_brand: company?.parent_brand ?? []
      })
    }
  }, [company, isEdit, isOpen, reset])

  const addAlias = () => {
    const alias = aliasInput.trim().toLowerCase()
    if (!alias) {
      return
    }

    const prevAlias = getValues('alias') ?? []
    if (prevAlias.includes(alias)) {
      toast.error('该会社别名已存在，请更换')
      return
    }

    setValue('alias', [...prevAlias, alias])
    setAliasInput('')
  }

  const handleRemoveAlias = (index: number) => {
    const prevAlias = getValues('alias') ?? []
    setValue(
      'alias',
      prevAlias.filter((_, itemIndex) => itemIndex !== index)
    )
  }

  const addWebsite = () => {
    const website = websiteInput.trim()
    if (!website) {
      return
    }

    const prevWebsite = getValues('official_website') ?? []
    if (prevWebsite.includes(website)) {
      toast.error('该站点地址已存在，请更换')
      return
    }

    setValue('official_website', [...prevWebsite, website])
    setWebsiteInput('')
  }

  const handleRemoveWebsite = (index: number) => {
    const prevWebsite = getValues('official_website') ?? []
    setValue(
      'official_website',
      prevWebsite.filter((_, itemIndex) => itemIndex !== index)
    )
  }

  const addParentBrand = () => {
    const brand = brandInput.trim().toLowerCase()
    if (!brand) {
      return
    }

    const prevBrand = getValues('parent_brand') ?? []
    if (prevBrand.includes(brand)) {
      toast.error('该上级品牌已存在，请更换')
      return
    }

    setValue('parent_brand', [...prevBrand, brand])
    setBrandInput('')
  }

  const handleRemoveParentBrand = (index: number) => {
    const prevBrand = getValues('parent_brand') ?? []
    setValue(
      'parent_brand',
      prevBrand.filter((_, itemIndex) => itemIndex !== index)
    )
  }

  const updateCompany = async (
    companyId: number,
    logoLink: string
  ): Promise<KunResponse<CompanyDetail>> => {
    return kunFetchPut<KunResponse<CompanyDetail>>('/company', {
      ...watch(),
      companyId,
      logoLink
    })
  }

  const createCompany = async (): Promise<KunResponse<Company>> => {
    return kunFetchPost<KunResponse<Company>>('/company', watch())
  }

  const handleSubmit = () => {
    startSubmit(async () => {
      try {
        const logoLink = ''

        if (isEdit) {
          const companyId = company!.id
          const res = await updateCompany(companyId, logoLink)
          const result = await kunErrorHandlerAsync(res)

          toast.success('会社信息更新成功')
          onSuccess(result)
          reset()
          return
        }

        const res = await createCompany()
        const result = await kunErrorHandlerAsync(res)

        toast.success('会社创建成功')
        onSuccess(result)
        reset()
      } catch (err) {
        errorReporter(err)
      }
    })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      onClose={handleClose}
      isDismissable={false}
      isKeyboardDismissDisabled
    >
      <ModalContent>
        <form>
          <ModalHeader>{isEdit ? '编辑会社信息' : '创建新会社'}</ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <Input
                {...register('name')}
                label="会社名称"
                placeholder="请输入会社名称"
                isInvalid={!!errors.name}
                errorMessage={errors.name?.message}
              />

              <Select
                label="主要语言"
                placeholder="请选择主要语言"
                selectionMode="multiple"
                defaultSelectedKeys={formDefaultValue.primary_language}
                onSelectionChange={(key) => {
                  setValue('primary_language', [...key] as string[])
                }}
                isInvalid={!!errors.primary_language}
                errorMessage={errors.primary_language?.message}
              >
                {languages.map((language) => (
                  <SelectItem key={language.key}>{language.value}</SelectItem>
                ))}
              </Select>

              <Textarea
                {...register('introduction')}
                label="会社简介"
                placeholder="请输入会社简介"
                isInvalid={!!errors.introduction}
                errorMessage={errors.introduction?.message}
              />

              <ArrayAdder
                label="别名"
                placeholder="可以按回车添加别名"
                input={aliasInput}
                setInput={setAliasInput}
                addItem={addAlias}
                removeItem={handleRemoveAlias}
                dataSource={watch('alias') ?? []}
              />

              <ArrayAdder
                label="官网链接"
                placeholder="可以按回车添加官网链接"
                input={websiteInput}
                setInput={setWebsiteInput}
                addItem={addWebsite}
                removeItem={handleRemoveWebsite}
                dataSource={watch('official_website') ?? []}
              />

              <ArrayAdder
                label="上级品牌"
                placeholder="可以按回车添加上级品牌"
                input={brandInput}
                setInput={setBrandInput}
                addItem={addParentBrand}
                removeItem={handleRemoveParentBrand}
                dataSource={watch('parent_brand') ?? []}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={handleClose}>
              取消
            </Button>
            <Button
              color="primary"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              onPress={handleSubmit}
            >
              {isEdit ? '保存' : '创建'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
