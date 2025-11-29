"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "@/store/hook"
import { submitRegistrationRequest, uploadRegistrationDocument, type CreateRegistrationRequestPayload } from "@/features/field-owner-registration"
// Note: uploadRegistrationDocument is now only used for business license upload
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomSuccessToast, CustomFailedToast } from "@/components/toast/notificiation-toast"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { PageWrapper } from "@/components/layouts/page-wrapper"
import PageHeader from "@/components/header-banner/page-header"
import { User, FileText, CreditCard, CheckCircle } from "lucide-react"
import { StepIndicator } from "./StepIndicator"
import { PersonalInfoStep } from "./PersonalInfoStep"
import { DocumentsStep } from "./DocumentsStep"
import { BankAccountStep } from "./BankAccountStep"
import { ConfirmationStep } from "./ConfirmationStep"
import { StepNavigation } from "./StepNavigation"
import { ImportantNotes } from "./ImportantNotes"

type RegistrationStep = 1 | 2 | 3 | 4

export default function FieldOwnerRegistrationPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { submitting } = useAppSelector((state) => state.registration)
  const authUser = useAppSelector((state) => state.auth.user)

  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1)
  const [formData, setFormData] = useState<Partial<CreateRegistrationRequestPayload>>({
    personalInfo: {
      fullName: authUser?.fullName || "",
      idNumber: "",
      address: "",
    },
    fieldImages: [],
    // documents: only businessLicense, optional
    documents: {},
    // eKYC fields (to be populated from didit eKYC integration)
    ekycSessionId: undefined,
    ekycData: undefined,
  })

  const steps = [
    { number: 1, title: "Thông tin cá nhân & eKYC", icon: User },
    { number: 2, title: "Ảnh sân & Giấy ĐKKD (tuỳ chọn)", icon: FileText },
    { number: 3, title: "Tài khoản ngân hàng", icon: CreditCard },
    { number: 4, title: "Xác nhận", icon: CheckCircle },
  ]

  const handleFormDataChange = (data: Partial<CreateRegistrationRequestPayload>) => {
    setFormData(data)
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as RegistrationStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as RegistrationStep)
    }
  }

  const handleSubmit = async () => {
    try {
      // Validate eKYC completion (required for identity verification)
      if (!formData.ekycSessionId || !formData.ekycData) {
        CustomFailedToast("Vui lòng hoàn thành xác thực danh tính bằng didit eKYC ở bước 1")
        return
      }

      // Validate personal info
      if (!formData.personalInfo?.fullName || !formData.personalInfo?.idNumber || !formData.personalInfo?.address) {
        CustomFailedToast("Vui lòng điền đầy đủ thông tin cá nhân")
        return
      }

      // Handle business license upload (optional)
      let businessLicenseUrl: string | undefined = undefined
      const documents = formData.documents as any
      
      if (documents) {
        const businessLicenseFile = documents.businessLicense_file
        if (businessLicenseFile instanceof File) {
          try {
            CustomSuccessToast("Đang tải lên giấy ĐKKD...")
            businessLicenseUrl = await dispatch(uploadRegistrationDocument(businessLicenseFile)).unwrap()
            if (!businessLicenseUrl || typeof businessLicenseUrl !== 'string' || businessLicenseUrl.trim() === '') {
              throw new Error('URL không hợp lệ từ server')
            }
          } catch (error: any) {
            CustomFailedToast(`Lỗi khi tải lên giấy ĐKKD: ${error.message || 'Upload thất bại'}`)
            return
          }
        } else if (documents.businessLicense && typeof documents.businessLicense === 'string' && documents.businessLicense.trim() !== '') {
          businessLicenseUrl = documents.businessLicense
        }
      }

      // Create payload
      const payload: CreateRegistrationRequestPayload = {
        personalInfo: formData.personalInfo!,
        fieldImages: formData.fieldImages || [],
        // Only include business license in documents (optional)
        documents: businessLicenseUrl
          ? {
              businessLicense: businessLicenseUrl,
            }
          : undefined,
        // eKYC fields
        ekycSessionId: formData.ekycSessionId,
        ekycData: formData.ekycData,
      }

      await dispatch(submitRegistrationRequest(payload)).unwrap()
      CustomSuccessToast("Đăng ký thành công! Chúng tôi sẽ xem xét trong vòng 1-3 ngày.")
      navigate("/field-owner-registration-status")
    } catch (error: any) {
      console.error('Registration error:', error)
      CustomFailedToast(error.message || "Đăng ký thất bại")
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} onFormDataChange={handleFormDataChange} />
      case 2:
        return <DocumentsStep formData={formData} onFormDataChange={handleFormDataChange} />
      case 3:
        return <BankAccountStep formData={formData} onFormDataChange={handleFormDataChange} />
      case 4:
        return <ConfirmationStep formData={formData} />
      default:
        return null
    }
  }

  return (
    <>
      <NavbarDarkComponent />
      <PageWrapper>
        <PageHeader
          title="Đăng ký làm chủ sân"
          breadcrumbs={[{ label: "Trang chủ", href: "/" }, { label: "Đăng ký chủ sân" }]}
        />

        <div className="max-w-5xl mx-auto px-4 py-8">
          <StepIndicator currentStep={currentStep} />

          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
              <div className="flex items-center gap-3">
                {React.createElement(steps[currentStep - 1].icon, {
                  className: "w-6 h-6 text-primary",
                })}
                <CardTitle className="text-2xl">{steps[currentStep - 1].title}</CardTitle>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Bước {currentStep} / {steps.length}
              </p>
            </CardHeader>
            <CardContent className="p-8">
              {renderStepContent()}

              <StepNavigation
                currentStep={currentStep}
                submitting={submitting}
                onBack={handleBack}
                onNext={handleNext}
                onSubmit={handleSubmit}
              />
            </CardContent>
          </Card>

          <ImportantNotes />
        </div>
      </PageWrapper>
    </>
  )
}

