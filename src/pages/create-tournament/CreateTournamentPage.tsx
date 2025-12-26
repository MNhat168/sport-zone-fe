"use client"

import { useState } from "react"
import { NavbarComponent } from "@/components/header/navbar-component"
import { FooterComponent } from "@/components/footer/footer-component"
import CreateTournamentStep1 from "./CreateTournamentStep1"
import CreateTournamentStep2 from "./CreateTournamentStep2"
import CreateTournamentStep3 from "./CreateTournamentStep3"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Lock, ArrowRight } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const steps = [
  { id: 1, name: "Thông Tin Cơ Bản", description: "Tên, môn, thời gian" },
  { id: 2, name: "Chọn Địa Điểm & Sân", description: "Địa điểm và sân thi đấu" },
  { id: 3, name: "Xác Nhận", description: "Kiểm tra và tạo" },
]

export default function CreateTournamentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const user = useSelector((state: RootState) => state.auth.user);

  // Logic for limits
  const MAX_ACTIVE_TOURNAMENTS = 3;
  const WEEKLY_LIMIT = user?.tournamentTier === 'PREMIUM' ? 3 : 1;
  const activeCount = user?.activeTournamentsCount || 0;
  const weeklyCount = user?.weeklyTournamentCreationCount || 0;

  const isActiveLimitReached = activeCount >= MAX_ACTIVE_TOURNAMENTS;
  const isWeeklyLimitReached = weeklyCount >= WEEKLY_LIMIT;
  const isLimitReached = isActiveLimitReached || isWeeklyLimitReached;

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

  const [direction, setDirection] = useState(0)
  const [nextTrigger, setNextTrigger] = useState(0)
  const [backTrigger, setBackTrigger] = useState(0)

  const handleUpdateFormData = (data: any) => {
    setFormData(data)
  }

  const handleNext = () => {
    setNextTrigger(prev => prev + 1)
  }

  const handleBack = () => {
    setBackTrigger(prev => prev + 1)
  }

  const proceedNext = () => {
    setDirection(1)
    setCurrentStep((prev) => Math.min(prev + 1, steps.length))
  }

  const proceedBack = () => {
    setDirection(-1)
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen bg-white py-12 pb-32 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-green-700 mb-3">Tạo Giải Đấu Mới</h1>
            <p className="text-lg text-gray-600 font-medium">Tổ chức giải đấu thể thao của bạn với SportZone</p>
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-green-700 mx-auto mt-4 rounded-full"></div>
          </div>
        </div>

        {isLimitReached && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <Lock className="h-5 w-5" />
              <AlertTitle className="ml-2 font-bold text-lg">Creation Limit Reached</AlertTitle>
              <AlertDescription className="ml-2 mt-2 text-base">
                {isActiveLimitReached ? (
                  <p>You have reached the maximum of {MAX_ACTIVE_TOURNAMENTS} active tournaments. Please complete or cancel existing ones.</p>
                ) : (
                  <p>You have reached your weekly creation limit of {WEEKLY_LIMIT} tournament(s). Limit resets on Monday.</p>
                )}
                <div className="mt-2 font-medium">
                  Active: {activeCount}/{MAX_ACTIVE_TOURNAMENTS} • Weekly: {weeklyCount}/{WEEKLY_LIMIT}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-b from-white to-green-50 overflow-visible">
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

          <div className="relative">
            {!isLimitReached && (
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                >
                  {currentStep === 1 && (
                    <CreateTournamentStep1
                      formData={formData}
                      onUpdate={handleUpdateFormData}
                      onNext={proceedNext}
                      nextTrigger={nextTrigger}
                    />
                  )}
                  {currentStep === 2 && (
                    <CreateTournamentStep2
                      formData={formData}
                      onUpdate={handleUpdateFormData}
                      onNext={proceedNext}
                      onBack={proceedBack}
                      nextTrigger={nextTrigger}
                      backTrigger={backTrigger}
                    />
                  )}
                  {currentStep === 3 && (
                    <CreateTournamentStep3
                      formData={formData}
                      onBack={proceedBack}
                      onUpdate={handleUpdateFormData}
                      backTrigger={backTrigger}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Global Navigation Footer */}
        {!isLimitReached && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={cn(
                  "h-14 px-8 rounded-2xl border-gray-200 font-black text-gray-500 hover:bg-gray-50 hover:text-green-700 transition-all active:scale-95",
                  currentStep === 1 && "opacity-0 pointer-events-none"
                )}
              >
                QUAY LẠI
              </Button>

              {currentStep < 3 && (
                <Button
                  onClick={handleNext}
                  className="h-14 flex-1 max-w-[300px] rounded-2xl bg-green-700 hover:bg-green-800 text-white font-black text-lg shadow-xl shadow-green-100 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 group"
                >
                  TIẾP THEO
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      <FooterComponent />
    </>
  );
}