"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, DollarSign, Trophy, Zap, Target } from "lucide-react"
import { SPORT_RULES_MAP, type SportType } from "../../../src/components/enums/ENUMS"

interface Step1Props {
  formData: any
  onUpdate: (data: any) => void
  onNext: () => void
}

export default function CreateTournamentStep1({ formData, onUpdate, onNext }: Step1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: any) => {
    onUpdate({ ...formData, [field]: value })

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }

    if (field === "sportType") {
      const rules = SPORT_RULES_MAP[value as SportType]
      onUpdate({
        ...formData,
        sportType: value,
        minParticipants: rules.minParticipants,
        maxParticipants: rules.maxParticipants,
        fieldsNeeded: rules.minFieldsRequired,
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = "Tên giải đấu là bắt buộc"
    if (!formData.sportType) newErrors.sportType = "Vui lòng chọn môn thể thao"
    if (!formData.startDate) newErrors.startDate = "Ngày bắt đầu là bắt buộc"
    if (!formData.endDate) newErrors.endDate = "Ngày kết thúc là bắt buộc"
    if (!formData.startTime) newErrors.startTime = "Giờ bắt đầu là bắt buộc"
    if (!formData.endTime) newErrors.endTime = "Giờ kết thúc là bắt buộc"

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu"
      }
    }

    if (!formData.minParticipants || formData.minParticipants < 1) {
      newErrors.minParticipants = "Số người tối thiểu phải lớn hơn 0"
    }

    if (!formData.maxParticipants || formData.maxParticipants < formData.minParticipants) {
      newErrors.maxParticipants = "Số người tối đa phải lớn hơn số người tối thiểu"
    }

    if (formData.registrationFee < 0) {
      newErrors.registrationFee = "Phí đăng ký không được âm"
    }

    if (!formData.description) {
      newErrors.description = "Mô tả là bắt buộc"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onNext()
    }
  }

  const selectedSportRules = formData.sportType ? SPORT_RULES_MAP[formData.sportType as SportType] : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE: POSTER SECTION */}
          <div className="lg:w-2/5 flex flex-col justify-between">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
              {/* Poster Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h1 className="text-4xl font-black tracking-tight">CREATE</h1>
                </div>
                <p className="text-green-100 text-lg font-semibold">Your Tournament</p>
              </div>

              {/* Tournament Name Preview */}
              {formData.name && (
                <div className="mb-8 p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm border border-white border-opacity-20">
                  <p className="text-green-100 text-sm font-medium mb-1">Tournament Name</p>
                  <p className="text-white text-2xl font-bold">{formData.name}</p>
                </div>
              )}

              {/* Sport Type Display */}
              {formData.sportType && (
                <div className="mb-6 space-y-3">
                  <p className="text-green-100 text-sm font-medium">Sport Type</p>
                  <div className="flex items-center gap-3 bg-white bg-opacity-10 p-3 rounded-lg">
                    <Target className="h-5 w-5" />
                    <span className="text-white font-semibold capitalize">{formData.sportType}</span>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="space-y-3 mb-8 pt-6 border-t border-white border-opacity-20">
                {formData.minParticipants && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-100 flex items-center gap-2">
                      <Users className="h-4 w-4" /> Participants
                    </span>
                    <span className="font-bold text-lg">
                      {formData.minParticipants}-{formData.maxParticipants}
                    </span>
                  </div>
                )}
                {formData.registrationFee !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-100 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Fee
                    </span>
                    <span className="font-bold text-lg">{formData.registrationFee.toLocaleString()} VNĐ</span>
                  </div>
                )}
              </div>

              {/* Motivational Text */}
              <div className="text-green-100 text-sm leading-relaxed">
                <p className="flex items-start gap-2">
                  <Zap className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>Build an amazing tournament experience. Fill in the details and let the games begin!</span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: FORM SECTION */}
          <div className="lg:w-3/5">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
              {/* Form Title */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Tournament Details</h2>
                <p className="text-gray-600">Provide basic information about your tournament</p>
              </div>

              <div className="space-y-6">
                {/* Tournament Name */}
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-semibold mb-2 block">
                    Tên Giải Đấu *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="VD: Giải Cầu Lông Mùa Xuân 2025"
                    className={`border-2 ${errors.name ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
                </div>

                {/* Sport Type */}
                <div>
                  <Label htmlFor="sportType" className="text-gray-700 font-semibold mb-2 block">
                    Môn Thể Thao *
                  </Label>
                  <Select value={formData.sportType || ""} onValueChange={(val) => handleChange("sportType", val)}>
                    <SelectTrigger
                      className={`border-2 ${errors.sportType ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    >
                      <SelectValue placeholder="Chọn môn thể thao" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="football">Bóng đá</SelectItem>
                      <SelectItem value="tennis">Quần vợt</SelectItem>
                      <SelectItem value="badminton">Cầu lông</SelectItem>
                      <SelectItem value="basketball">Bóng rổ</SelectItem>
                      <SelectItem value="volleyball">Bóng chuyền</SelectItem>
                      <SelectItem value="pickleball">Pickleball</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sportType && <p className="text-red-500 text-sm mt-2">{errors.sportType}</p>}

                  {selectedSportRules && (
                    <div className="mt-3 p-4 bg-green-50 rounded-lg text-sm text-gray-700 border border-green-200">
                      <p className="font-semibold text-gray-900 mb-1">{selectedSportRules.description}</p>
                      <p className="text-gray-600">
                        Participants: {selectedSportRules.minParticipants}-{selectedSportRules.maxParticipants} |
                        Fields: {selectedSportRules.minFieldsRequired}-{selectedSportRules.maxFieldsRequired} |
                        Duration: {selectedSportRules.typicalDuration}h
                      </p>
                    </div>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="startDate"
                      className="text-gray-700 font-semibold mb-2 block flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Ngày Bắt Đầu *
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate || ""}
                      onChange={(e) => handleChange("startDate", e.target.value)}
                      className={`border-2 ${errors.startDate ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-2">{errors.startDate}</p>}
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="text-gray-700 font-semibold mb-2 block">
                      Ngày Kết Thúc *
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate || ""}
                      onChange={(e) => handleChange("endDate", e.target.value)}
                      className={`border-2 ${errors.endDate ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    />
                    {errors.endDate && <p className="text-red-500 text-sm mt-2">{errors.endDate}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="startTime"
                      className="text-gray-700 font-semibold mb-2 block flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4" />
                      Giờ Bắt Đầu *
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime || ""}
                      onChange={(e) => handleChange("startTime", e.target.value)}
                      className={`border-2 ${errors.startTime ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    />
                    {errors.startTime && <p className="text-red-500 text-sm mt-2">{errors.startTime}</p>}
                  </div>

                  <div>
                    <Label htmlFor="endTime" className="text-gray-700 font-semibold mb-2 block">
                      Giờ Kết Thúc *
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime || ""}
                      onChange={(e) => handleChange("endTime", e.target.value)}
                      className={`border-2 ${errors.endTime ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    />
                    {errors.endTime && <p className="text-red-500 text-sm mt-2">{errors.endTime}</p>}
                  </div>
                </div>

                {/* Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="minParticipants"
                      className="text-gray-700 font-semibold mb-2 block flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Số Người Tối Thiểu *
                    </Label>
                    <Input
                      id="minParticipants"
                      type="number"
                      min={selectedSportRules?.minParticipants || 1}
                      max={selectedSportRules?.maxParticipants || 100}
                      value={formData.minParticipants || ""}
                      onChange={(e) => handleChange("minParticipants", Number.parseInt(e.target.value))}
                      className={`border-2 ${errors.minParticipants ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    />
                    {errors.minParticipants && <p className="text-red-500 text-sm mt-2">{errors.minParticipants}</p>}
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants" className="text-gray-700 font-semibold mb-2 block">
                      Số Người Tối Đa *
                    </Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min={formData.minParticipants || 1}
                      max={selectedSportRules?.maxParticipants || 100}
                      value={formData.maxParticipants || ""}
                      onChange={(e) => handleChange("maxParticipants", Number.parseInt(e.target.value))}
                      className={`border-2 ${errors.maxParticipants ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    />
                    {errors.maxParticipants && <p className="text-red-500 text-sm mt-2">{errors.maxParticipants}</p>}
                  </div>
                </div>

                {/* Registration Fee */}
                <div>
                  <Label
                    htmlFor="registrationFee"
                    className="text-gray-700 font-semibold mb-2 block flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Phí Đăng Ký (VNĐ) *
                  </Label>
                  <Input
                    id="registrationFee"
                    type="number"
                    min={0}
                    value={formData.registrationFee || 0}
                    onChange={(e) => handleChange("registrationFee", Number.parseFloat(e.target.value))}
                    placeholder="150000"
                    className={`border-2 ${errors.registrationFee ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                  />
                  {errors.registrationFee && <p className="text-red-500 text-sm mt-2">{errors.registrationFee}</p>}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-gray-700 font-semibold mb-2 block">
                    Mô Tả *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Mô tả chi tiết về giải đấu..."
                    rows={4}
                    className={`border-2 ${errors.description ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description}</p>}
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-6 border-t border-green-100">
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-6 rounded-lg shadow-md transition-all duration-200"
                  >
                    Tiếp Theo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
