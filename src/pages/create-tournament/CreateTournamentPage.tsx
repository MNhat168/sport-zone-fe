"use client"

import { useState } from "react"
import { NavbarComponent } from "@/components/header/navbar-component"
import { FooterComponent } from "@/components/footer/footer-component"
import CreateTournamentStep1 from "./CreateTournamentStep1"
import CreateTournamentStep2 from "./CreateTournamentStep2"
import CreateTournamentStep3 from "./CreateTournamentStep3"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

const steps = [
  { id: 1, name: "Thông Tin Cơ Bản", description: "Tên, môn, thời gian" },
  { id: 2, name: "Chọn Địa Điểm & Sân", description: "Địa điểm và sân thi đấu" },
  { id: 3, name: "Xác Nhận", description: "Kiểm tra và tạo" },
]

export default function CreateTournamentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    sportType: "",
    location: "",
    tournamentDate: "", // Single tournament date
    registrationStart: "", // Registration period start
    registrationEnd: "", // Registration period end
    startTime: "",
    endTime: "",
    category: "",
    competitionFormat: "",
    numberOfTeams: 4, // Default number of teams
    teamSize: undefined, // Will be set based on sport and category
    maxParticipants: 0, // Calculated based on teams
    minParticipants: 0, // Calculated based on teams
    registrationFee: 0,
    description: "",
    courtsNeeded: 2, // Changed from fieldsNeeded
    selectedCourtIds: [], // Changed from selectedFieldIds
    totalCourtCost: 0,
    fieldsNeeded: 2,
    selectedFieldIds: [],
    totalFieldCost: 0,
    rules: "",
    images: [],
  })

  const handleUpdateFormData = (data: any) => {
    setFormData(data)
  }

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length))
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-green-700 mb-3">Tạo Giải Đấu Mới</h1>
            <p className="text-lg text-gray-600 font-medium">Tổ chức giải đấu thể thao của bạn với SportZone</p>
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-green-700 mx-auto mt-4 rounded-full"></div>
          </div>

          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-b from-white to-green-50">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex items-start"
                    style={{ width: index < steps.length - 1 ? "100%" : "auto" }}
                  >
                    <div className="flex flex-col items-center" style={{ minWidth: "140px" }}>
                      <div
                        className={`flex items-center justify-center w-16 h-16 rounded-full font-bold text-lg transition-all duration-300 shadow-md ${currentStep > step.id
                            ? "bg-green-600 border-2 border-green-700 text-white scale-105"
                            : currentStep === step.id
                              ? "border-3 border-green-600 text-green-600 bg-green-50 scale-110"
                              : "border-2 border-gray-300 text-gray-400 bg-white"
                          }`}
                      >
                        {currentStep > step.id ? (
                          <CheckCircle2 className="h-8 w-8" />
                        ) : (
                          <span className="text-xl">{step.id}</span>
                        )}
                      </div>
                      <div className="mt-4 text-center">
                        <p
                          className={`text-sm font-bold transition-colors ${currentStep >= step.id ? "text-green-700" : "text-gray-400"
                            }`}
                        >
                          {step.name}
                        </p>
                        <p className={`text-xs mt-1 ${currentStep >= step.id ? "text-gray-600" : "text-gray-400"}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 mx-4 self-start transition-all duration-300 rounded-full ${currentStep > step.id ? "bg-green-600 shadow-md" : "bg-gray-200"
                          }`}
                        style={{ flexGrow: 1, marginTop: "32px" }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            {currentStep === 1 && (
              <CreateTournamentStep1 formData={formData} onUpdate={handleUpdateFormData} onNext={handleNext} />
            )}
            {currentStep === 2 && (
              <CreateTournamentStep2
                formData={formData}
                onUpdate={handleUpdateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <CreateTournamentStep3
                formData={formData}
                onBack={handleBack}
                onUpdate={handleUpdateFormData} 
              />
            )}
          </div>
        </div>
      </div>
      <FooterComponent />
    </>
  )
}