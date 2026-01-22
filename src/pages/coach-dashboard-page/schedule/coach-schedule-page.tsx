"use client"

import { useEffect, useState } from "react"
import axiosPublic from "@/utils/axios/axiosPublic"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
} from "date-fns"
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Booking } from "@/types/booking-type"
import { CoachDashboardLayout } from "@/components/layouts/coach-dashboard-layout"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import logger from "@/utils/logger"

export default function CoachSchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [_userId, setUserId] = useState<string | null>(null)
  const [_coachId, setCoachId] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const hourHeight = 45
  const firstHour = 5

  /* ---------------- DATA LOAD ---------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = sessionStorage.getItem("user")
        if (!storedUser) return

        const user = JSON.parse(storedUser)
        const id = user._id
        if (!id) return

        setUserId(id)

        const coachRes = await axiosPublic.get(`/profiles/coach-id/${id}`)
        const coachId = coachRes.data?.data?.id
        setCoachId(coachId)

        if (coachId) {
          const bookingRes = await axiosPublic.get(`/bookings/coach/${coachId}`)
          const accepted = (bookingRes.data?.data || []).filter(
            (b: Booking) => b.coachStatus === "accepted"
          )
          setBookings(accepted)
        }
      } catch (err) {
        logger.error("Load schedule failed:", err)
      }
    }

    loadData()
  }, [])

  /* ---------------- HELPERS ---------------- */
  const bookingUser =
    selectedBooking?.user && typeof selectedBooking.user === "object"
      ? selectedBooking.user
      : null

  const formatTimeAMPM = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    const hour = h % 12 || 12
    const period = h < 12 ? "AM" : "PM"
    return `${hour}:${m.toString().padStart(2, "0")} ${period}`
  }

  const getBookingTitle = (b: Booking) => {
    if (b.field?.name) return b.field.name
    if (b.user && typeof b.user === "object") return b.user.fullName
    return "Training Session"
  }

  const getShortLocation = (
    location?: string | { address?: string }
  ) => {
    if (!location) return "—"
    if (typeof location === "string")
      return location.split(",").slice(0, 2).join(",")
    if (location.address)
      return location.address.split(",").slice(0, 2).join(",")
    return "—"
  }

  /* ---------------- CALENDAR ---------------- */
  const handlePrevWeek = () => setCurrentDate((d) => subWeeks(d, 1))
  const handleNextWeek = () => setCurrentDate((d) => addWeeks(d, 1))

  const days = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  })

  const hours = Array.from({ length: 17 }, (_, i) => i + firstHour)

  const getBookingsForDay = (day: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.date), day))

  /* ---------------- UI ---------------- */
  return (
    <CoachDashboardLayout>
      <div className="min-h-screen bg-gray-50 px-6 py-6">
        {/* Header */}
        <div className="bg-white border rounded-xl shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Training Schedule
              </h1>
            </div>

            <DatePicker
              selected={currentDate}
              onChange={(d) => d && setCurrentDate(d)}
              dateFormat="MMMM d, yyyy"
              className="border rounded-md px-3 py-1.5 text-sm cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button size="sm" variant="outline" onClick={handlePrevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <p className="text-sm font-medium text-gray-700">
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM dd")} –{" "}
              {format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMM dd, yyyy")}
            </p>

            <Button size="sm" variant="outline" onClick={handleNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-green-50">
              <tr>
                <th className="w-20 border-r"></th>
                {days.map((day) => (
                  <th
                    key={day.toISOString()}
                    className="border-r py-3 text-center"
                  >
                    <p className="text-xs text-gray-500">
                      {format(day, "EEE")}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {format(day, "dd")}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr>
                {/* Time column */}
                <td className="border-r bg-gray-50">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-[45px] pr-2 text-xs text-gray-500 flex justify-end items-start"
                    >
                      {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                    </div>
                  ))}
                </td>

                {/* Days */}
                {days.map((day) => {
                  const dayBookings = getBookingsForDay(day)

                  return (
                    <td key={day.toISOString()} className="relative border-r">
                      {dayBookings.map((b) => {
                        const [sh, sm] = b.startTime.split(":").map(Number)
                        const [eh, em] = b.endTime.split(":").map(Number)

                        const top = (sh + sm / 60 - firstHour) * hourHeight
                        const height =
                          (eh + em / 60 - sh - sm / 60) * hourHeight

                        return (
                          <div
                            key={b._id}
                            style={{ top, height }}
                            onClick={() => setSelectedBooking(b)}
                            className="absolute left-1 right-1 bg-green-50 border border-green-200 rounded-lg shadow-sm cursor-pointer hover:bg-green-100 transition flex"
                          >
                            <div className="w-1 bg-green-600 rounded-l-lg" />

                            <div className="p-2 text-[11px] leading-tight w-full">
                              <p className="font-semibold text-green-900 truncate">
                                {getBookingTitle(b)}
                              </p>

                              <p className="text-gray-600 truncate">
                                {b.field?.name
                                  ? getShortLocation(b.field?.location)
                                  : "Personal coaching"}
                              </p>

                              <p className="text-gray-500 mt-0.5">
                                {formatTimeAMPM(b.startTime)} –{" "}
                                {formatTimeAMPM(b.endTime)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
            <div className="w-[420px] h-full bg-white shadow-xl flex flex-col">
              <div className="p-5 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Session details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Coaching schedule
                  </p>
                </div>
                <button onClick={() => setSelectedBooking(null)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6">
                  <img
                    src={bookingUser?.avatarUrl ?? "/default-avatar.png"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {bookingUser?.fullName ?? "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500">Client</p>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="h-1 bg-green-600" />
                  <div className="p-4 space-y-3 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium">
                        {format(new Date(selectedBooking.date), "MMM dd, yyyy")}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Time</span>
                      <span className="font-medium">
                        {formatTimeAMPM(selectedBooking.startTime)} –{" "}
                        {formatTimeAMPM(selectedBooking.endTime)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Field</span>
                      <span className="font-medium text-right">
                        {selectedBooking.field?.name ?? "—"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Location</span>
                      <span className="font-medium text-right">
                        {getShortLocation(selectedBooking.field?.location)}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-500">Total price</span>
                      <span className="font-semibold text-green-700">
                        {selectedBooking.bookingAmount} VND
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CoachDashboardLayout>
  )
}
