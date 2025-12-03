"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Trophy, Zap, Target, Users2, Hash } from "lucide-react"
import { 
  getCategoryDisplayName, 
  getFormatDisplayName, 
  SPORT_RULES_MAP, 
  type SportType,
  getDefaultTeamSize,
  calculateParticipants,
  isTeamSport
} from "../../../src/components/enums/ENUMS"

interface Step1Props {
  formData: any
  onUpdate: (data: any) => void
  onNext: () => void
}

export default function CreateTournamentStep1({ formData, onUpdate, onNext }: Step1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showTeamSizeInput, setShowTeamSizeInput] = useState(false)
  const [teamSize, setTeamSize] = useState<number | undefined>()

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    
    if (field === "sportType") {
      const rules = SPORT_RULES_MAP[value as SportType]
      const defaultTeamSize = getDefaultTeamSize(value, newData.category || "")
      setTeamSize(defaultTeamSize)
      setShowTeamSizeInput(rules?.supportsTeamSizeOverride || false)
      
      newData.numberOfTeams = rules.minTeams
      newData.teamSize = defaultTeamSize
      newData.minParticipants = calculateParticipants(rules.minTeams, value, newData.category || "", defaultTeamSize)
      newData.maxParticipants = calculateParticipants(rules.maxTeams, value, newData.category || "", defaultTeamSize)
    }
    
    if (field === "category") {
      const defaultTeamSize = getDefaultTeamSize(newData.sportType, value)
      setTeamSize(defaultTeamSize)
      newData.teamSize = defaultTeamSize
      
      // Recalculate participants based on new category
      if (newData.numberOfTeams) {
        newData.minParticipants = calculateParticipants(newData.numberOfTeams, newData.sportType, value, defaultTeamSize)
        newData.maxParticipants = calculateParticipants(newData.numberOfTeams, newData.sportType, value, defaultTeamSize)
      }
    }
    
    if (field === "numberOfTeams" || field === "teamSize") {
      const currentTeamSize = field === "teamSize" ? value : newData.teamSize
      const currentTeams = field === "numberOfTeams" ? value : newData.numberOfTeams
      
      if (currentTeams && currentTeamSize) {
        newData.minParticipants = calculateParticipants(currentTeams, newData.sportType, newData.category || "", currentTeamSize)
        newData.maxParticipants = calculateParticipants(currentTeams, newData.sportType, newData.category || "", currentTeamSize)
      }
    }
    
    onUpdate(newData)
    
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  useEffect(() => {
    if (formData.sportType && formData.category) {
      const rules = SPORT_RULES_MAP[formData.sportType as SportType]
      const defaultTeamSize = getDefaultTeamSize(formData.sportType, formData.category)
      setTeamSize(defaultTeamSize)
      setShowTeamSizeInput(rules?.supportsTeamSizeOverride || false)
      
      if (!formData.teamSize) {
        onUpdate({ ...formData, teamSize: defaultTeamSize })
      }
    }
  }, [formData.sportType, formData.category])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = "Tên giải đấu là bắt buộc"
    if (!formData.sportType) newErrors.sportType = "Vui lòng chọn môn thể thao"
    if (!formData.tournamentDate) newErrors.tournamentDate = "Ngày diễn ra giải đấu là bắt buộc"
    if (!formData.registrationStart) newErrors.registrationStart = "Ngày bắt đầu đăng ký là bắt buộc"
    if (!formData.registrationEnd) newErrors.registrationEnd = "Ngày kết thúc đăng ký là bắt buộc"
    if (!formData.startTime) newErrors.startTime = "Giờ bắt đầu là bắt buộc"
    if (!formData.endTime) newErrors.endTime = "Giờ kết thúc là bắt buộc"
    if (!formData.category) newErrors.category = "Vui lòng chọn thể loại"
    if (!formData.competitionFormat) newErrors.competitionFormat = "Vui lòng chọn hình thức thi đấu"
    if (!formData.numberOfTeams) newErrors.numberOfTeams = "Vui lòng nhập số lượng đội"

    const selectedSportRules = formData.sportType ? SPORT_RULES_MAP[formData.sportType as SportType] : null
    
    if (selectedSportRules) {
      if (formData.numberOfTeams < selectedSportRules.minTeams) {
        newErrors.numberOfTeams = `Số đội tối thiểu là ${selectedSportRules.minTeams}`
      }
      if (formData.numberOfTeams > selectedSportRules.maxTeams) {
        newErrors.numberOfTeams = `Số đội tối đa là ${selectedSportRules.maxTeams}`
      }
    }

    // Validate registration period
    if (formData.registrationStart && formData.registrationEnd) {
      if (new Date(formData.registrationStart) > new Date(formData.registrationEnd)) {
        newErrors.registrationEnd = "Ngày kết thúc đăng ký phải sau ngày bắt đầu"
      }
    }

    // Validate that registration ends before tournament date
    if (formData.registrationEnd && formData.tournamentDate) {
      if (new Date(formData.registrationEnd) >= new Date(formData.tournamentDate)) {
        newErrors.registrationEnd = "Đăng ký phải kết thúc trước ngày diễn ra giải đấu"
      }
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
  const isTeamBased = isTeamSport(formData.sportType)

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
                  <div className="bg-gradient-to-br from-gray-900 to-gray-80 bg-opacity-20 p-3 rounded-xl">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h1 className="text-4xl font-black tracking-tight">CREATE</h1>
                </div>
                <p className="text-green-100 text-lg font-semibold">Your Tournament</p>
              </div>

              {/* Tournament Name Preview */}
              {formData.name && (
                <div className="mb-8 p-4 bg-gradient-to-br from-gray-900 to-gray-800 bg-opacity-10 rounded-xl backdrop-blur-sm border border-white border-opacity-20">
                  <p className="text-green-100 text-sm font-medium mb-1">Tournament Name</p>
                  <p className="text-white text-2xl font-bold">{formData.name}</p>
                </div>
              )}

              {/* Sport Type Display */}
              {formData.sportType && (
                <div className="mb-6 space-y-3">
                  <p className="text-green-100 text-sm font-medium">Sport Type</p>
                  <div className="flex items-center gap-3 bg-gradient-to-br from-gray-900 to-gray-80 bg-opacity-10 p-3 rounded-lg">
                    <Target className="h-5 w-5" />
                    <span className="text-white font-semibold capitalize">{formData.sportType}</span>
                  </div>
                </div>
              )}

              {/* Teams & Participants Preview */}
              {formData.numberOfTeams && (
                <div className="mb-6 space-y-4">
                  <div className="space-y-2">
                    <p className="text-green-100 text-sm font-medium">Tournament Structure</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 bg-opacity-10 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users2 className="h-4 w-4" />
                          <span className="text-sm">Teams</span>
                        </div>
                        <p className="text-white font-bold text-lg">{formData.numberOfTeams}</p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 bg-opacity-10 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">Players</span>
                        </div>
                        <p className="text-white font-bold text-lg">{formData.minParticipants || formData.maxParticipants}</p>
                      </div>
                    </div>
                  </div>
                  
                  {isTeamBased && formData.teamSize && (
                    <div className="bg-gradient-to-br from-gray-900 to-gray-80 bg-opacity-10 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span className="text-sm">Team Size</span>
                      </div>
                      <p className="text-white font-bold text-lg">{formData.teamSize} players/team</p>
                    </div>
                  )}
                </div>
              )}

              {/* Date Preview */}
              {formData.tournamentDate && (
                <div className="mb-6 space-y-3">
                  <p className="text-green-100 text-sm font-medium">Tournament Date</p>
                  <div className="flex items-center gap-3 bg-gradient-to-br from-gray-900 to-gray-80 bg-opacity-10 p-3 rounded-lg">
                    <Calendar className="h-5 w-5" />
                    <span className="text-white font-semibold">
                      {new Date(formData.tournamentDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              )}

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
                        Teams: {selectedSportRules.minTeams}-{selectedSportRules.maxTeams} |
                        Fields: {selectedSportRules.minFieldsRequired}-{selectedSportRules.maxFieldsRequired} |
                        Duration: {selectedSportRules.typicalDuration}h
                      </p>
                    </div>
                  )}
                </div>

                {/* Tournament Date */}
                <div>
                  <Label
                    htmlFor="tournamentDate"
                    className="text-gray-700 font-semibold mb-2 block flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Ngày Diễn Ra Giải Đấu *
                  </Label>
                  <Input
                    id="tournamentDate"
                    type="date"
                    value={formData.tournamentDate || ""}
                    onChange={(e) => handleChange("tournamentDate", e.target.value)}
                    className={`border-2 ${errors.tournamentDate ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                  />
                  {errors.tournamentDate && <p className="text-red-500 text-sm mt-2">{errors.tournamentDate}</p>}
                </div>

                {/* Registration Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="registrationStart"
                      className="text-gray-700 font-semibold mb-2 block"
                    >
                      Ngày Bắt Đầu Đăng Ký *
                    </Label>
                    <Input
                      id="registrationStart"
                      type="date"
                      value={formData.registrationStart || ""}
                      onChange={(e) => handleChange("registrationStart", e.target.value)}
                      className={`border-2 ${errors.registrationStart ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    />
                    {errors.registrationStart && <p className="text-red-500 text-sm mt-2">{errors.registrationStart}</p>}
                  </div>

                  <div>
                    <Label
                      htmlFor="registrationEnd"
                      className="text-gray-700 font-semibold mb-2 block"
                    >
                      Ngày Kết Thúc Đăng Ký *
                    </Label>
                    <Input
                      id="registrationEnd"
                      type="date"
                      value={formData.registrationEnd || ""}
                      onChange={(e) => handleChange("registrationEnd", e.target.value)}
                      className={`border-2 ${errors.registrationEnd ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    />
                    {errors.registrationEnd && <p className="text-red-500 text-sm mt-2">{errors.registrationEnd}</p>}
                  </div>
                </div>

                {/* Time Slot */}
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
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Sport Category */}
                  <div>
                    <Label htmlFor="category" className="text-gray-700 font-semibold mb-2 block">
                      Thể Loại *
                    </Label>
                    <Select
                      value={formData.category || ""}
                      onValueChange={(val) => handleChange("category", val)}
                    >
                      <SelectTrigger className={`border-2 ${errors.category ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}>
                        <SelectValue placeholder="Chọn thể loại" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSportRules?.availableCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {getCategoryDisplayName(category, formData.sportType)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-red-500 text-sm mt-2">{errors.category}</p>}
                  </div>

                  {/* Competition Format */}
                  <div>
                    <Label htmlFor="competitionFormat" className="text-gray-700 font-semibold mb-2 block">
                      Hình Thức Thi Đấu *
                    </Label>
                    <Select
                      value={formData.competitionFormat || selectedSportRules?.defaultFormat || ""}
                      onValueChange={(val) => handleChange("competitionFormat", val)}
                    >
                      <SelectTrigger className={`border-2 ${errors.competitionFormat ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}>
                        <SelectValue placeholder="Chọn hình thức" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSportRules?.availableFormats.map((format) => (
                          <SelectItem key={format} value={format}>
                            {getFormatDisplayName(format)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.competitionFormat && <p className="text-red-500 text-sm mt-2">{errors.competitionFormat}</p>}
                  </div>
                </div>

                {/* Teams Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="numberOfTeams"
                      className="text-gray-700 font-semibold mb-2 block flex items-center gap-2"
                    >
                      <Users2 className="h-4 w-4" />
                      Số Lượng Đội *
                    </Label>
                    <Input
                      id="numberOfTeams"
                      type="number"
                      min={selectedSportRules?.minTeams || 1}
                      max={selectedSportRules?.maxTeams || 100}
                      value={formData.numberOfTeams || ""}
                      onChange={(e) => handleChange("numberOfTeams", Number.parseInt(e.target.value))}
                      className={`border-2 ${errors.numberOfTeams ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                    />
                    {errors.numberOfTeams && <p className="text-red-500 text-sm mt-2">{errors.numberOfTeams}</p>}
                    {selectedSportRules && (
                      <p className="text-xs text-gray-500 mt-1">
                        Từ {selectedSportRules.minTeams} đến {selectedSportRules.maxTeams} đội
                      </p>
                    )}
                  </div>

                  {/* Team Size (for team sports that support override) */}
                  {showTeamSizeInput && teamSize && (
                    <div>
                      <Label htmlFor="teamSize" className="text-gray-700 font-semibold mb-2 block">
                        Số Người Mỗi Đội *
                      </Label>
                      <Input
                        id="teamSize"
                        type="number"
                        min={1}
                        max={20}
                        value={formData.teamSize || teamSize}
                        onChange={(e) => handleChange("teamSize", Number.parseInt(e.target.value))}
                        className={`border-2 ${errors.teamSize ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Mặc định: {teamSize} người (có thể thay đổi)
                      </p>
                    </div>
                  )}
                </div>

                {/* Participants Summary */}
                {(formData.minParticipants || formData.maxParticipants) && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Tổng Số Người Tham Gia:</p>
                        <p className="text-lg font-bold text-blue-600">
                          {formData.minParticipants || formData.maxParticipants} người
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          {formData.numberOfTeams} đội × {formData.teamSize || getDefaultTeamSize(formData.sportType, formData.category)} người/đội
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Số người sẽ tự động tính dựa trên số đội và số người mỗi đội
                    </p>
                  </div>
                )}

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