"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Trophy, Zap, Target, Users2, Hash, CalendarRange, CalendarDays, ArrowRight } from "lucide-react"
import {
    getCategoryDisplayName,
    getFormatDisplayName,
    SPORT_RULES_MAP,
    type SportType,
    getDefaultTeamSize,
    calculateParticipants,
    isTeamSport
} from "../../../src/components/enums/ENUMS"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, differenceInDays, isBefore, isAfter, addWeeks, startOfDay } from "date-fns"
import { vi } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Step1Props {
    formData: any
    onUpdate: (data: any) => void
    onNext: () => void
    nextTrigger?: number
}

interface DateRange {
    from: Date | undefined
    to: Date | undefined
}

interface Time {
    hours: number
    minutes: number
}

export default function CreateTournamentStep1({ formData, onUpdate, onNext, nextTrigger }: Step1Props) {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const lastNextTrigger = useRef(nextTrigger || 0);

    useEffect(() => {
        if (nextTrigger && nextTrigger > lastNextTrigger.current) {
            lastNextTrigger.current = nextTrigger;
            handleNext()
        }
    }, [nextTrigger])
    const [showTeamSizeInput, setShowTeamSizeInput] = useState(false)
    const [teamSize, setTeamSize] = useState<number | undefined>()
    const [registrationDate, setRegistrationDate] = useState<DateRange>({
        from: formData.registrationStart ? new Date(formData.registrationStart) : undefined,
        to: formData.registrationEnd ? new Date(formData.registrationEnd) : undefined,
    })
    const [tournamentDate, setTournamentDate] = useState<Date | undefined>(
        formData.tournamentDate ? new Date(formData.tournamentDate) : undefined
    )
    const [showTimeDialog, setShowTimeDialog] = useState<boolean>(false)
    const [selectedTimeType, setSelectedTimeType] = useState<"start" | "end">("start")
    const [startTime, setStartTime] = useState<Time>({ hours: 8, minutes: 0 })
    const [endTime, setEndTime] = useState<Time>({ hours: 17, minutes: 0 })

    const handleChange = (field: string, value: any) => {
        const newData = { ...formData, [field]: value }

        if (field === "sportType") {
            const rules = SPORT_RULES_MAP[value as SportType]
            const defaultTeamSize = getDefaultTeamSize(value, newData.category || "")
            setTeamSize(defaultTeamSize)
            setShowTeamSizeInput(rules?.supportsTeamSizeOverride || false)

            newData.numberOfTeams = rules.minTeams
            newData.teamSize = defaultTeamSize
            newData.maxParticipants = calculateParticipants(rules.maxTeams, value, newData.category || "", defaultTeamSize)

            // Set default times based on sport duration
            const duration = rules?.typicalDuration || 2
            const startH = 6
            const endH = Math.min(startH + duration, 23)
            const startTimeStr = `${startH.toString().padStart(2, "0")}:00`
            const endTimeStr = `${endH.toString().padStart(2, "0")}:00`

            newData.startTime = startTimeStr
            newData.endTime = endTimeStr

            setStartTime({ hours: startH, minutes: 0 })
            setEndTime({ hours: endH, minutes: 0 })
        }

        if (field === "category") {
            const defaultTeamSize = getDefaultTeamSize(newData.sportType, value)
            setTeamSize(defaultTeamSize)
            newData.teamSize = defaultTeamSize

            // Recalculate participants based on new category
            if (newData.numberOfTeams) {
                newData.maxParticipants = calculateParticipants(newData.numberOfTeams, newData.sportType, value, defaultTeamSize)
            }
        }

        if (field === "numberOfTeams" || field === "teamSize") {
            const currentTeamSize = field === "teamSize" ? value : newData.teamSize
            const currentTeams = field === "numberOfTeams" ? value : newData.numberOfTeams

            if (currentTeams && currentTeamSize) {
                newData.maxParticipants = calculateParticipants(currentTeams, newData.sportType, newData.category || "", currentTeamSize)
            }
        }

        onUpdate(newData)

        if (errors[field]) {
            setErrors({ ...errors, [field]: "" })
        }
    }

    // Handle registration date range change
    const handleRegistrationDateChange = (range: DateRange | undefined) => {
        if (!range) return

        setRegistrationDate(range)

        if (range.from) {
            const newData = {
                ...formData,
                registrationStart: format(range.from, "yyyy-MM-dd")
            }
            onUpdate(newData)
            if (errors.registrationStart) setErrors({ ...errors, registrationStart: "" })
        }

        if (range.to) {
            const newData = {
                ...formData,
                registrationEnd: format(range.to, "yyyy-MM-dd")
            }
            onUpdate(newData)
            if (errors.registrationEnd) setErrors({ ...errors, registrationEnd: "" })
        }
    }

    // Handle tournament date change
    const handleTournamentDateChange = (date: Date | undefined) => {
        setTournamentDate(date)

        if (date) {
            const newData = {
                ...formData,
                tournamentDate: format(date, "yyyy-MM-dd")
            }
            onUpdate(newData)
            if (errors.tournamentDate) setErrors({ ...errors, tournamentDate: "" })
        }
    }

    // Handle time selection with clock layout
    const handleTimeDialogOpen = () => {
        // Parse current times
        const startStr = formData.startTime || "08:00"
        const endStr = formData.endTime || "17:00"

        const [startHours, startMinutes] = startStr.split(":").map(Number)
        const [endHours, endMinutes] = endStr.split(":").map(Number)

        setStartTime({ hours: startHours, minutes: startMinutes })
        setEndTime({ hours: endHours, minutes: endMinutes })
        setSelectedTimeType("start")
        setShowTimeDialog(true)
    }

    const handleTimeConfirm = () => {
        const startTimeStr = `${startTime.hours.toString().padStart(2, "0")}:${startTime.minutes.toString().padStart(2, "0")}`
        const endTimeStr = `${endTime.hours.toString().padStart(2, "0")}:${endTime.minutes.toString().padStart(2, "0")}`

        // Validate that start time is before end time
        const startTotalMinutes = startTime.hours * 60 + startTime.minutes
        const endTotalMinutes = endTime.hours * 60 + endTime.minutes

        if (startTotalMinutes >= endTotalMinutes) {
            // Show error but still allow setting
            setErrors({ ...errors, endTime: "Giờ kết thúc phải sau giờ bắt đầu" })
        } else {
            if (errors.endTime) setErrors({ ...errors, endTime: "" })
        }

        const newData = {
            ...formData,
            startTime: startTimeStr,
            endTime: endTimeStr
        }

        onUpdate(newData)
        setShowTimeDialog(false)
    }

    // Initialize times from form data
    useEffect(() => {
        if (formData.startTime) {
            const [hours, minutes] = formData.startTime.split(":").map(Number)
            setStartTime({ hours, minutes })
        }
        if (formData.endTime) {
            const [hours, minutes] = formData.endTime.split(":").map(Number)
            setEndTime({ hours, minutes })
        }
    }, [formData.startTime, formData.endTime])

    // Initialize registration dates with flexible defaults
    useEffect(() => {
        if (!formData.registrationStart && !formData.registrationEnd) {
            const today = new Date()
            const defaultFrom = today
            const defaultTo = addDays(today, 14) // Default 2 weeks registration period

            // Only set defaults if no dates are already set
            setRegistrationDate({ from: defaultFrom, to: defaultTo })

            onUpdate({
                ...formData,
                registrationStart: format(defaultFrom, "yyyy-MM-dd"),
                registrationEnd: format(defaultTo, "yyyy-MM-dd")
            })
        }
    }, [])

    // Initialize tournament date
    useEffect(() => {
        if (!tournamentDate && registrationDate.to) {
            const defaultTournamentDate = addDays(registrationDate.to, 7) // Default 1 week after registration ends
            setTournamentDate(defaultTournamentDate)
            onUpdate({
                ...formData,
                tournamentDate: format(defaultTournamentDate, "yyyy-MM-dd")
            })
        }
    }, [registrationDate.to])

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
            const regStart = new Date(formData.registrationStart)
            const regEnd = new Date(formData.registrationEnd)

            if (isAfter(regStart, regEnd)) {
                newErrors.registrationEnd = "Ngày kết thúc đăng ký phải sau ngày bắt đầu"
            }

            // Registration period must be at least 1 day
            if (differenceInDays(regEnd, regStart) < 0) {
                newErrors.registrationEnd = "Thời gian đăng ký phải ít nhất 1 ngày"
            }

            // Registration cannot end before today (but can start before today for ongoing registrations)
            const today = startOfDay(new Date())
            if (isBefore(regEnd, today)) {
                newErrors.registrationEnd = "Ngày kết thúc đăng ký không được trước hôm nay"
            }
        }

        // Validate that tournament date is at least 1 day after registration ends
        if (formData.registrationEnd && formData.tournamentDate) {
            const regEnd = new Date(formData.registrationEnd)
            const tournamentDate = new Date(formData.tournamentDate)

            if (!isAfter(tournamentDate, regEnd)) {
                newErrors.tournamentDate = "Ngày diễn ra giải đấu phải sau ngày kết thúc đăng ký"
            }

            // Tournament date cannot be more than 1 week after registration ends
            const maxTournamentDate = addWeeks(regEnd, 1)
            if (isAfter(tournamentDate, maxTournamentDate)) {
                newErrors.tournamentDate = "Ngày diễn ra giải đấu không được muộn hơn 1 tuần sau ngày kết thúc đăng ký"
            }
        }

        // Validate tournament date cannot be before registration start
        if (formData.registrationStart && formData.tournamentDate) {
            const regStart = new Date(formData.registrationStart)
            const tournamentDate = new Date(formData.tournamentDate)

            if (isBefore(tournamentDate, regStart)) {
                newErrors.tournamentDate = "Ngày diễn ra giải đấu không được trước ngày bắt đầu đăng ký"
            }
        }

        // Validate tournament date cannot be in the past
        if (formData.tournamentDate) {
            const tournamentDate = new Date(formData.tournamentDate)
            const today = startOfDay(new Date())
            if (isBefore(tournamentDate, today)) {
                newErrors.tournamentDate = "Ngày diễn ra giải đấu không được trong quá khứ"
            }
        }

        // Validate time slots
        if (formData.startTime && formData.endTime) {
            const [startHour, startMin] = formData.startTime.split(":").map(Number)
            const [endHour, endMin] = formData.endTime.split(":").map(Number)

            if (startHour > endHour || (startHour === endHour && startMin >= endMin)) {
                newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu"
            }

            // Minimum duration of 1 hour
            const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
            if (durationMinutes < 60) {
                newErrors.endTime = "Thời gian giải đấu phải ít nhất 1 giờ"
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

    // Unified Clock Layout Component
    const UnifiedClockLayout = () => {
        const [activeFocus, setActiveFocus] = useState<"start" | "end">("start")
        const hourValues = Array.from({ length: 12 }, (_, i) => i) // 0-11 for AM

        const minuteValues = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
        const minuteLabels = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"]

        // Calculate total minutes for validation
        const startTotalMinutes = startTime.hours * 60 + startTime.minutes
        const endTotalMinutes = endTime.hours * 60 + endTime.minutes
        const durationMinutes = endTotalMinutes - startTotalMinutes
        const durationHours = Math.floor(durationMinutes / 60)
        const durationRemainingMinutes = durationMinutes % 60

        const currentActiveTime = activeFocus === "start" ? startTime : endTime
        const setTime = activeFocus === "start" ? setStartTime : setEndTime

        return (
            <div className="p-4 md:p-6">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-center text-2xl font-black text-gray-800 tracking-tight">
                        THIẾT LẬP THỜI GIAN
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-8">
                    {/* Focus Toggles */}
                    <div className="flex w-full max-w-sm bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
                        <button
                            onClick={() => setActiveFocus("start")}
                            className={cn(
                                "flex-1 flex flex-col items-center py-3 rounded-xl transition-all duration-300",
                                activeFocus === "start" ? "bg-white shadow-md text-green-700 scale-[1.02]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Bắt đầu</span>
                            <span className="text-2xl font-black">
                                {startTime.hours.toString().padStart(2, "0")}:{startTime.minutes.toString().padStart(2, "0")}
                            </span>
                        </button>
                        <div className="w-px h-8 bg-gray-200 self-center mx-1" />
                        <button
                            onClick={() => setActiveFocus("end")}
                            className={cn(
                                "flex-1 flex flex-col items-center py-3 rounded-xl transition-all duration-300",
                                activeFocus === "end" ? "bg-white shadow-md text-blue-700 scale-[1.02]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Kết thúc</span>
                            <span className="text-2xl font-black">
                                {endTime.hours.toString().padStart(2, "0")}:{endTime.minutes.toString().padStart(2, "0")}
                            </span>
                        </button>
                    </div>

                    <div className="w-full flex flex-col lg:flex-row gap-12 items-center justify-center">
                        {/* THE CLOCK */}
                        <div className="relative">
                            {/* AM/PM Bubble */}
                            <div className="absolute -top-6 -left-6 flex flex-col gap-2 z-20">
                                <Button
                                    size="sm"
                                    variant={currentActiveTime.hours < 12 ? "default" : "outline"}
                                    onClick={() => {
                                        if (currentActiveTime.hours >= 12) setTime({ ...currentActiveTime, hours: currentActiveTime.hours - 12 })
                                    }}
                                    className={cn(
                                        "h-12 w-12 rounded-2xl font-black text-xs shadow-lg transition-all",
                                        currentActiveTime.hours < 12
                                            ? (activeFocus === "start" ? "bg-green-600 border-0" : "bg-blue-600 border-0")
                                            : "bg-white text-gray-400 border-gray-100"
                                    )}
                                >
                                    AM
                                </Button>
                                <Button
                                    size="sm"
                                    variant={currentActiveTime.hours >= 12 ? "default" : "outline"}
                                    onClick={() => {
                                        if (currentActiveTime.hours < 12) setTime({ ...currentActiveTime, hours: currentActiveTime.hours + 12 })
                                    }}
                                    className={cn(
                                        "h-12 w-12 rounded-2xl font-black text-xs shadow-lg transition-all",
                                        currentActiveTime.hours >= 12
                                            ? (activeFocus === "start" ? "bg-green-600 border-0" : "bg-blue-600 border-0")
                                            : "bg-white text-gray-400 border-gray-100"
                                    )}
                                >
                                    PM
                                </Button>
                            </div>

                            <div className="relative w-72 h-72 bg-white rounded-full border-8 border-gray-50 shadow-2xl flex items-center justify-center">
                                {/* SVG Range Shadow */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible">
                                    {(() => {
                                        const startTotalDeg = (startTime.hours % 12) * 30 + startTime.minutes * 0.5
                                        const endTotalDeg = (endTime.hours % 12) * 30 + endTime.minutes * 0.5
                                        const startRad = startTotalDeg * (Math.PI / 180)
                                        const endRad = endTotalDeg * (Math.PI / 180)
                                        const radius = 110
                                        const centerX = 144
                                        const centerY = 144
                                        const x1 = centerX + radius * Math.cos(startRad)
                                        const y1 = centerY + radius * Math.sin(startRad)
                                        const x2 = centerX + radius * Math.cos(endRad)
                                        const y2 = centerY + radius * Math.sin(endRad)
                                        const sweep = (endTotalDeg - startTotalDeg + 360) % 360
                                        const largeArcFlag = sweep > 180 ? 1 : 0
                                        return (
                                            <path
                                                d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                                fill={activeFocus === "start" ? "rgba(22, 163, 74, 0.08)" : "rgba(37, 99, 235, 0.08)"}
                                                stroke={activeFocus === "start" ? "rgba(22, 163, 74, 0.3)" : "rgba(37, 99, 235, 0.3)"}
                                                strokeWidth="2"
                                                strokeDasharray="4 4"
                                            />
                                        )
                                    })()}
                                </svg>

                                {/* Center Dot */}
                                <div className="absolute w-4 h-4 bg-gray-200 rounded-full z-20" />

                                {/* Inner Track */}
                                <div className="absolute inset-4 rounded-full border-2 border-dashed border-gray-100" />

                                {/* Clock Numbers */}
                                {hourValues.map((hour, index) => {
                                    const displayHour = hour === 0 ? 12 : hour
                                    const isAM = currentActiveTime.hours < 12
                                    const currentHourValue = isAM ? hour : hour + 12
                                    const isSelected = currentActiveTime.hours === currentHourValue

                                    // Other points
                                    const startIsAM = startTime.hours < 12
                                    const startVal = startIsAM ? startTime.hours : startTime.hours - 12
                                    const isStartPoint = startVal === hour

                                    const endIsAM = endTime.hours < 12
                                    const endVal = endIsAM ? endTime.hours : endTime.hours - 12
                                    const isEndPoint = endVal === hour

                                    const angle = (index * 30) * (Math.PI / 180)
                                    const x = Math.sin(angle) * 110
                                    const y = -Math.cos(angle) * 110

                                    return (
                                        <button
                                            key={hour}
                                            className={cn(
                                                "absolute w-12 h-12 flex items-center justify-center rounded-2xl transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 text-base font-black z-10",
                                                isSelected
                                                    ? (activeFocus === "start" ? "bg-green-600 text-white shadow-xl shadow-green-100 scale-110" : "bg-blue-600 text-white shadow-xl shadow-blue-100 scale-110")
                                                    : "text-gray-300 hover:text-gray-900 hover:bg-gray-50 bg-transparent"
                                            )}
                                            style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                                            onClick={() => setTime({ ...currentActiveTime, hours: isAM ? hour : hour + 12 })}
                                        >
                                            {displayHour}

                                            {/* Indicators for non-focused time */}
                                            {!isSelected && isStartPoint && (
                                                <div className="absolute -bottom-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                                            )}
                                            {!isSelected && isEndPoint && (
                                                <div className="absolute -top-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                                            )}
                                        </button>
                                    )
                                })}

                                {/* Active Hands */}
                                <div
                                    className={cn(
                                        "absolute bottom-1/2 left-1/2 w-1.5 origin-bottom rounded-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)",
                                        activeFocus === "start" ? "bg-green-100 h-28" : "bg-blue-100 h-28"
                                    )}
                                    style={{ transform: `translateX(-50%) rotate(${(currentActiveTime.hours % 12) * 30 + (currentActiveTime.minutes * 0.5)}deg)` }}
                                />
                            </div>
                        </div>

                        {/* Minute Picker */}
                        <div className="w-full lg:w-48 space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="h-px bg-gray-100 flex-1" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Chọn Phút</span>
                                <div className="h-px bg-gray-100 flex-1" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {minuteValues.map((mv, i) => (
                                    <Button
                                        key={mv}
                                        variant={currentActiveTime.minutes === mv ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTime({ ...currentActiveTime, minutes: mv })}
                                        className={cn(
                                            "font-black rounded-xl h-12 transition-all",
                                            currentActiveTime.minutes === mv
                                                ? (activeFocus === "start" ? "bg-green-600 border-0 shadow-lg shadow-green-100 text-white" : "bg-blue-600 border-0 shadow-lg shadow-blue-100 text-white")
                                                : "text-gray-400 border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                                        )}
                                    >
                                        {minuteLabels[i]}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary & Actions */}
                <div className="mt-12 pt-8 border-t border-gray-100 space-y-8">
                    {/* Duration Info */}
                    <div className={cn(
                        "flex items-center justify-between p-5 rounded-[2rem] transition-all duration-500",
                        durationMinutes < 60 ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "bg-gray-50 text-gray-600"
                    )}>
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center",
                                durationMinutes < 60 ? "bg-red-100" : "bg-green-100"
                            )}>
                                <Clock className={cn("h-6 w-6", durationMinutes < 60 ? "text-red-600" : "text-green-600")} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Tổng thời lượng</div>
                                <div className="text-xl font-black">
                                    {durationHours} giờ {durationRemainingMinutes > 0 ? `${durationRemainingMinutes} phút` : ""}
                                </div>
                                {selectedSportRules?.typicalDuration && (
                                    <div className="text-[9px] font-bold text-gray-400 flex items-center gap-1 mt-1">
                                        <Zap className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                                        GỢI Ý CHO {selectedSportRules.displayName.toUpperCase()}: {selectedSportRules.typicalDuration} TIẾNG
                                    </div>
                                )}
                            </div>
                        </div>
                        {durationMinutes < 60 ? (
                            <Badge variant="destructive" className="font-black px-3 py-1">⚠️ THỜI GIAN NGẮN</Badge>
                        ) : (
                            <Badge className="bg-green-600 font-black px-3 py-1">HỢP LỆ</Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(h => (
                            <Button
                                key={h}
                                variant="outline"
                                className="h-12 rounded-2xl border-gray-100 text-gray-500 font-black text-xs hover:border-green-200 hover:bg-green-50 hover:text-green-700 transition-all active:scale-95"
                                onClick={() => {
                                    let endH = startTime.hours + h
                                    setEndTime({ hours: endH >= 24 ? 23 : endH, minutes: startTime.minutes })
                                    setActiveFocus("end")
                                }}
                            >
                                +{h} GIỜ
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => setShowTimeDialog(false)} className="flex-1 rounded-2xl h-14 font-black text-gray-400 hover:text-gray-600 tracking-widest">
                            HỦY BỎ
                        </Button>
                        <Button
                            onClick={handleTimeConfirm}
                            disabled={durationMinutes < 60}
                            className="flex-[2] rounded-2xl h-14 font-black bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale"
                        >
                            XÁC NHẬN THỜI GIAN
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

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
                                                <p className="text-white font-bold text-lg">{formData.maxParticipants}</p>
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

                            {/* Time Preview */}
                            {formData.startTime && formData.endTime && (
                                <div className="mb-6 space-y-3">
                                    <p className="text-green-100 text-sm font-medium">Time Slot</p>
                                    <div className="flex items-center gap-3 bg-gradient-to-br from-gray-900 to-gray-80 bg-opacity-10 p-3 rounded-lg">
                                        <Clock className="h-5 w-5" />
                                        <span className="text-white font-semibold">
                                            {formData.startTime} - {formData.endTime}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Registration Period Preview */}
                            {formData.registrationStart && formData.registrationEnd && (
                                <div className="mb-6 space-y-3">
                                    <p className="text-green-100 text-sm font-medium">Registration Period</p>
                                    <div className="flex items-center gap-3 bg-gradient-to-br from-gray-900 to-gray-80 bg-opacity-10 p-3 rounded-lg">
                                        <CalendarRange className="h-5 w-5" />
                                        <span className="text-white font-semibold text-sm">
                                            {new Date(formData.registrationStart).toLocaleDateString('vi-VN')} - {new Date(formData.registrationEnd).toLocaleDateString('vi-VN')}
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

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Sport Category */}
                                    <div>
                                        <Label htmlFor="category" className="text-gray-700 font-semibold mb-2 block">
                                            Thể Loại *
                                        </Label>
                                        <Select
                                            value={formData.category || ""}
                                            onValueChange={(val) => handleChange("category", val)}
                                            disabled={!formData.sportType}
                                        >
                                            <SelectTrigger className={`border-2 ${errors.category ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}>
                                                <SelectValue placeholder={formData.sportType ? "Chọn thể loại" : "Chọn môn trước"} />
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
                                            disabled={!formData.sportType}
                                        >
                                            <SelectTrigger className={`border-2 ${errors.competitionFormat ? "border-red-500" : "border-green-200"} focus:border-green-500 focus:ring-green-500 rounded-lg`}>
                                                <SelectValue placeholder={formData.sportType ? "Chọn hình thức" : "Chọn môn trước"} />
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

                                {/* Registration Period - FLEXIBLE VERSION */}
                                <div>
                                    <Label className="text-gray-700 font-semibold mb-2 block flex items-center gap-2">
                                        <CalendarRange className="h-4 w-4" />
                                        Thời Gian Đăng Ký *
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Ngày bắt đầu - kết thúc</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal border-2",
                                                            errors.registrationStart || errors.registrationEnd
                                                                ? "border-red-500"
                                                                : "border-green-200",
                                                            !registrationDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        {registrationDate?.from ? (
                                                            registrationDate.to ? (
                                                                <>
                                                                    {format(registrationDate.from, "dd/MM/yyyy")} -{" "}
                                                                    {format(registrationDate.to, "dd/MM/yyyy")}
                                                                </>
                                                            ) : (
                                                                format(registrationDate.from, "dd/MM/yyyy")
                                                            )
                                                        ) : (
                                                            <span>Chọn thời gian đăng ký</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-white shadow-xl border border-gray-200 rounded-lg" align="start">
                                                    <CalendarComponent
                                                        initialFocus
                                                        mode="range"
                                                        defaultMonth={registrationDate?.from}
                                                        selected={registrationDate}
                                                        onSelect={(range) => handleRegistrationDateChange(range as DateRange)}
                                                        numberOfMonths={2}
                                                        locale={vi}
                                                        className="rounded-md border-0"
                                                        disabled={(date) => {
                                                            // Start date can be flexible (even in the past for ongoing registrations)
                                                            // End date cannot be before today
                                                            const today = startOfDay(new Date())

                                                            // If we're selecting a range and we have a start date,
                                                            // we need to check if this date is the end date
                                                            if (registrationDate.from && date < registrationDate.from) {
                                                                return true // End date can't be before start date
                                                            }

                                                            // When selecting end date, it can't be before today
                                                            // But when selecting start date, it can be flexible
                                                            if (!registrationDate.from && date < today) {
                                                                return false // Allow selecting past dates for start
                                                            }

                                                            return false
                                                        }}
                                                    />
                                                    <div className="p-3 border-t bg-gray-50">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span>Thời gian đăng ký:</span>
                                                                <span className="font-semibold">
                                                                    {registrationDate.from && registrationDate.to
                                                                        ? `${differenceInDays(registrationDate.to, registrationDate.from) + 1} ngày`
                                                                        : "0 ngày"}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                <p>• Ngày bắt đầu có thể trong quá khứ (đăng ký đang diễn ra)</p>
                                                                <p>• Ngày kết thúc không được trước hôm nay</p>
                                                                <p>• Đăng ký phải kết thúc trước ngày thi đấu</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            {(errors.registrationStart || errors.registrationEnd) && (
                                                <p className="text-red-500 text-sm mt-2">
                                                    {errors.registrationStart || errors.registrationEnd}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Thông tin đăng ký</Label>
                                            <Card className="p-3 border-2 border-green-200 bg-green-50">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">
                                                            {registrationDate.from
                                                                ? format(registrationDate.from, "dd/MM/yyyy")
                                                                : "Chưa chọn"}
                                                            {" - "}
                                                            {registrationDate.to
                                                                ? format(registrationDate.to, "dd/MM/yyyy")
                                                                : "Chưa chọn"}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {registrationDate.from && registrationDate.to
                                                                ? `${differenceInDays(registrationDate.to, registrationDate.from) + 1} ngày đăng ký`
                                                                : "Chọn thời gian đăng ký"}
                                                        </p>
                                                        {registrationDate.from && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Badge variant={
                                                                    registrationDate.from < startOfDay(new Date())
                                                                        ? "secondary"
                                                                        : "outline"
                                                                } className="text-xs">
                                                                    {registrationDate.from < startOfDay(new Date())
                                                                        ? "Đang diễn ra"
                                                                        : "Sắp bắt đầu"}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </div>

                                {/* Tournament Date */}
                                <div>
                                    <Label className="text-gray-700 font-semibold mb-2 block flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Ngày Diễn Ra Giải Đấu *
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal border-2",
                                                            errors.tournamentDate ? "border-red-500" : "border-green-200",
                                                            !tournamentDate && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        {tournamentDate ? (
                                                            format(tournamentDate, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Chọn ngày thi đấu</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-white shadow-xl border border-gray-200 rounded-lg" align="start">
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={tournamentDate}
                                                        onSelect={handleTournamentDateChange}
                                                        disabled={(date) => {
                                                            // Can't select dates in the past
                                                            const today = new Date()
                                                            if (date < today) return true

                                                            // Tournament must be after registration ends and within 1 week
                                                            if (registrationDate.to) {
                                                                const minDate = addDays(registrationDate.to, 1)
                                                                const maxDate = addWeeks(registrationDate.to, 1)
                                                                return date < minDate || date > maxDate
                                                            }

                                                            return false
                                                        }}
                                                        locale={vi}
                                                        className="rounded-md border-0"
                                                    />
                                                    {registrationDate.to && (
                                                        <div className="p-3 border-t bg-gray-50">
                                                            <p className="text-sm text-gray-600">
                                                                Phải sau ngày đăng ký và trong vòng 1 tuần sau {format(registrationDate.to, "dd/MM/yyyy")}
                                                            </p>
                                                        </div>
                                                    )}
                                                </PopoverContent>
                                            </Popover>
                                            {errors.tournamentDate && <p className="text-red-500 text-sm mt-2">{errors.tournamentDate}</p>}
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium mb-2 block">Thông tin ngày thi đấu</Label>
                                            <Card className="p-3 border-2 border-blue-200 bg-blue-50">
                                                <p className="text-sm font-medium">
                                                    {tournamentDate
                                                        ? format(tournamentDate, "dd/MM/yyyy")
                                                        : "Chưa chọn ngày"}
                                                </p>
                                                {registrationDate.to && tournamentDate && (
                                                    <div>
                                                        <p className="text-xs text-gray-600">
                                                            {differenceInDays(tournamentDate, registrationDate.to)} ngày sau khi đăng ký kết thúc
                                                        </p>
                                                        {differenceInDays(tournamentDate, registrationDate.to) > 7 && (
                                                            <p className="text-xs text-red-600 mt-1">
                                                                ⚠️ Quá 1 tuần sau khi đăng ký kết thúc
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </Card>
                                        </div>
                                    </div>
                                </div>

                                {/* Time Slot - Combined */}
                                <div>
                                    <Label className="text-gray-700 font-semibold mb-2 block flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Thời Gian Thi Đấu *
                                    </Label>

                                    {/* Time Display Card */}
                                    <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
                                        <DialogTrigger asChild>
                                            <Card className="p-4 border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all cursor-pointer">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center">
                                                            <div className="text-sm font-medium text-gray-600">Bắt đầu</div>
                                                            <div className="text-2xl font-bold text-green-700">
                                                                {formData.startTime || "08:00"}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {formData.startTime ? (parseInt(formData.startTime.split(":")[0]) < 12 ? "Sáng" : "Chiều") : "Sáng"}
                                                            </div>
                                                        </div>

                                                        <ArrowRight className="h-6 w-6 text-gray-400" />

                                                        <div className="text-center">
                                                            <div className="text-sm font-medium text-gray-600">Kết thúc</div>
                                                            <div className="text-2xl font-bold text-blue-700">
                                                                {formData.endTime || "17:00"}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {formData.endTime ? (parseInt(formData.endTime.split(":")[0]) < 12 ? "Sáng" : "Chiều") : "Chiều"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-end">
                                                        <Button variant="outline" size="sm" onClick={handleTimeDialogOpen}>
                                                            <Clock className="h-4 w-4 mr-2" />
                                                            Chỉnh sửa
                                                        </Button>
                                                        <div className="text-sm text-gray-600 mt-2">
                                                            {formData.startTime && formData.endTime ? (
                                                                (() => {
                                                                    const [startHour, startMin] = formData.startTime.split(":").map(Number)
                                                                    const [endHour, endMin] = formData.endTime.split(":").map(Number)
                                                                    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
                                                                    const hours = Math.floor(durationMinutes / 60)
                                                                    const minutes = durationMinutes % 60
                                                                    return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ""}`
                                                                })()
                                                            ) : "0 giờ"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-2xl bg-white max-h-[95vh] overflow-y-auto">
                                            <UnifiedClockLayout />
                                        </DialogContent>
                                    </Dialog>


                                    {/* Error Messages */}
                                    <div className="space-y-2 mt-2">
                                        {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime}</p>}
                                        {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime}</p>}
                                    </div>

                                    {/* Duration Summary */}
                                    {!!formData.maxParticipants && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">Tổng thời gian thi đấu</p>
                                                    <p className={cn(
                                                        (() => {
                                                            const [startHour, startMin] = formData.startTime.split(":").map(Number)
                                                            const [endHour, endMin] = formData.endTime.split(":").map(Number)
                                                            const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
                                                            return durationMinutes >= 60 ? "text-green-600" : "text-red-600"
                                                        })()
                                                    )}>
                                                        {(() => {
                                                            const [startHour, startMin] = formData.startTime.split(":").map(Number)
                                                            const [endHour, endMin] = formData.endTime.split(":").map(Number)
                                                            const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
                                                            const hours = Math.floor(durationMinutes / 60)
                                                            const minutes = durationMinutes % 60
                                                            return `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ""}`
                                                        })()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Giờ bắt đầu: {formData.startTime}</p>
                                                    <p className="text-sm text-gray-600">Giờ kết thúc: {formData.endTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                {!!formData.maxParticipants && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">Tổng Số Người Tham Gia:</p>
                                                <p className="text-lg font-bold text-blue-600">
                                                    {formData.maxParticipants} người
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


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}