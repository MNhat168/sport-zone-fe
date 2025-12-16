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
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { CoachDashboardLayout } from '@/components/layouts/coach-dashboard-layout'

export default function CoachSchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const hourHeight = 45
  const firstHour = 5 // 5 AM

  useEffect(() => {
    const loadUserAndFetchData = async () => {
      try {
        const storedUser = sessionStorage.getItem("user")
        if (!storedUser) return

        const user = JSON.parse(storedUser)
        const id = user._id || user.id
        if (!id) return

        // ✅ fetch coach profile by user ID
        const response = await axiosPublic.get(`/profiles/coach-id/${id}`)
        const coachId = response.data?.data?.coachId

        // ✅ fetch accepted bookings for that coach
        if (coachId) {
          const bookingRes = await axiosPublic.get(`/bookings/coach/${coachId}`)
          const allBookings: Booking[] = bookingRes.data?.data || []
          const accepted = allBookings.filter((b) => b.coachStatus === "accepted")
          setBookings(accepted)
        }
      } catch (err) {
        console.error("[loadUserAndFetchData] Failed to fetch coach data:", err)
      }
    }

    loadUserAndFetchData()
  }, [])

  // --- Navigation ---
  const handlePrevWeek = () => setCurrentDate((d) => subWeeks(d, 1))
  const handleNextWeek = () => setCurrentDate((d) => addWeeks(d, 1))

  const days = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  })
  const hours = Array.from({ length: 17 }, (_, i) => i + firstHour)
  const getBookingsForDay = (day: Date) =>
    bookings.filter((b) => isSameDay(new Date(b.date), day))

  const getShortLocation = (location?: string) => {
    if (!location) return "No location"
    return location.split(",").slice(0, 2).join(",")
  }

  return (
    <CoachDashboardLayout>
      <main className="max-w-[1600px] mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-700" />
              <h1 className="text-2xl font-semibold text-gray-800">Booking Schedule</h1>
            </div>

            <div>
              <DatePicker
                selected={currentDate}
                onChange={(date: Date | null) => date && setCurrentDate(date)}
                dateFormat="MMMM d, yyyy"
                className="border rounded px-2 py-1 w-52 cursor-pointer"
              />
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={handlePrevWeek} className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <div className="text-center font-medium text-gray-700">
              {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM dd")} -{" "}
              {format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMM dd, yyyy")}
            </div>
            <Button variant="outline" onClick={handleNextWeek} className="flex items-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto border rounded-lg shadow-sm bg-white">
            <table className="w-full min-w-[1400px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100 w-20 text-center">Time</th>
                  {days.map((day, idx) => (
                    <th key={idx} className="border p-2 bg-gray-100 text-center">
                      {format(day, "EEE dd/MM")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Time Column */}
                  <td className="border p-0">
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="border-b flex items-center justify-center text-xs bg-gray-50"
                        style={{ height: `${hourHeight}px` }}
                      >
                        {hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                      </div>
                    ))}
                  </td>

                  {/* Day Columns */}
                  {days.map((day, dayIdx) => {
                    const dayBookings = getBookingsForDay(day)
                    return (
                      <td key={dayIdx} className="border p-0 relative" style={{ height: `${hours.length * hourHeight}px` }}>
                        {dayBookings.map((b) => {
                          const [startH, startM] = b.startTime.split(":").map(Number)
                          const [endH, endM] = b.endTime.split(":").map(Number)
                          const top = (startH + startM / 60 - firstHour) * hourHeight
                          const height = (endH + endM / 60 - startH - startM / 60) * hourHeight
                          return (
                            <div
                              key={b._id}
                              className="absolute left-1 right-1 bg-blue-50 border border-blue-200 rounded-lg shadow-sm text-xs overflow-hidden flex flex-col justify-center items-center text-center p-1 cursor-pointer hover:bg-blue-100"
                              style={{ top, height }}
                              onClick={() => setSelectedBooking(b)}
                            >
                              <p className="font-medium">{b.field?.name || "Unknown Field"}</p>
                              <p className="text-gray-500">{getShortLocation(b.field?.location)}</p>
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
        </main>

        {/* Booking Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[400px] max-w-full relative">
              <button className="absolute top-2 right-2 p-1" onClick={() => setSelectedBooking(null)}>
                <X className="w-5 h-5 text-gray-700" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img
                  src={typeof selectedBooking.user !== "string"
                    ? selectedBooking.user.avatarUrl
                    : "/default-avatar.png"}
                  alt={typeof selectedBooking.user !== "string"
                    ? selectedBooking.user.fullName
                    : "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <p className="font-medium">
                  {typeof selectedBooking.user !== "string"
                    ? selectedBooking.user.fullName
                    : "Unknown User"}
                </p>
              </div>

              <p className="mb-2"><strong>Field:</strong> {selectedBooking.field?.name}</p>
              <p className="mb-2"><strong>Location:</strong> {getShortLocation(selectedBooking.field?.location)}</p>
              <p className="mb-2"><strong>Date:</strong> {format(new Date(selectedBooking.date), "MMM dd, yyyy")}</p>
              <p className="mb-2"><strong>Time:</strong> {selectedBooking.startTime} - {selectedBooking.endTime}</p>
              <p className="mb-2"><strong>Total Price:</strong> ${selectedBooking.totalPrice}</p>
            </div>
          </div>
        )}
    </CoachDashboardLayout>
  )
}
