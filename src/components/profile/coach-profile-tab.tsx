import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppSelector, useAppDispatch } from "@/store/hook"
import { getCoachById, updateCoach } from "@/features/coach/coachThunk"
import { toast } from "sonner"
import { Trophy, Star } from "lucide-react"

export default function CoachProfileTab() {
    const dispatch = useAppDispatch()

    const authUser = useAppSelector((state) => state.auth.user)

    const [formData, setFormData] = useState({
        specialization: [] as string[],
        experience: "",
        certifications: "",
        hourlyRate: "",
        bio: "",
        achievements: "",
        rank: "",
    })

    // Fetch coach profile data on component mount
    useEffect(() => {
        if (authUser?._id && authUser?.role === "coach") {
            // Fetch full coach detail (backend expects user id for /coaches/:id)
            dispatch(getCoachById(authUser._id as string));
        }
    }, [authUser?._id, dispatch])

    // current coach from redux
    const currentCoach = useAppSelector((s) => s.coach.currentCoach)
    const detailLoading = useAppSelector((s) => s.coach.detailLoading)

    // Update form data when coach data is loaded
    useEffect(() => {
        if (currentCoach && authUser?.role === "coach") {
            setFormData({
                specialization: Array.isArray((currentCoach as any).sports) ? (currentCoach as any).sports : (Array.isArray((currentCoach as any).lessonTypes) ? (currentCoach as any).lessonTypes.map((l: any) => l.type || l.name) : []),
                experience: (currentCoach as any)?.coachingDetails?.experience ?? "",
                certifications: (currentCoach as any)?.coachingDetails?.certification ?? "",
                hourlyRate: "",
                bio: (currentCoach as any)?.description ?? "",
                achievements: "",
                rank: (currentCoach as any)?.level ?? "",
            })
        }
    }, [currentCoach, authUser?.role])

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleToggleSpecialization = (value: string) => {
        setFormData(prev => {
            const current = prev.specialization as string[]
            if (current.includes(value)) {
                return { ...prev, specialization: current.filter(v => v !== value) }
            }
            return { ...prev, specialization: [...current, value] }
        })
    }

    // Handle form submit
    const handleSubmit = async () => {
        if (!authUser?._id || authUser?.role !== "coach") {
            toast.error("Access denied. Coach role required.")
            return
        }

        try {
            await dispatch(updateCoach({
                id: authUser._id as string,
                data: {
                    bio: formData.bio,
                    sports: formData.specialization,
                    certification: formData.certifications,
                    rank: formData.rank,
                    experience: formData.experience,
                }
            })).unwrap()

            toast.success("Coach profile updated successfully!")
        } catch (error: any) {
            toast.error(error?.message || "Failed to update coach profile")
        }
    }

    // Handle reset form
    const handleReset = () => {
        setFormData({
            specialization: [],
            experience: "",
            certifications: "",
            hourlyRate: "",
            bio: "",
            achievements: "",
            rank: "",
        })
    }

    return (
        <Card className="w-full bg-white rounded-[10px] shadow-[0px_4px_44px_0px_rgba(211,211,211,0.25)] border-0">
            <CardContent className="p-6">
                <div className="space-y-10">
                    {/* Header Section */}
                    <div className="flex items-center gap-3 pb-5 border-b border-gray-200">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            Coach Profile Information
                        </h2>
                    </div>

                    {/* Coaching Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-700">
                            Coaching Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Specialization *
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {['football', 'basketball', 'tennis', 'badminton', 'swimming', 'volleyball', 'pickleball', 'gym'].map((spec) => (
                                        <label key={spec} className="inline-flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-md cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(formData.specialization as string[]).includes(spec)}
                                                onChange={() => handleToggleSpecialization(spec)}
                                                className="w-4 h-4"
                                            />
                                            <span className="capitalize">{spec}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Experience
                                </Label>
                                <Textarea
                                    value={formData.experience}
                                    onChange={(e) => handleInputChange('experience', e.target.value)}
                                    placeholder="Describe your coaching experience, background and approach..."
                                    className="min-h-[100px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Hourly Rate (VND)
                                </Label>
                                <Input
                                    type="number"
                                    value={formData.hourlyRate}
                                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                                    placeholder="Enter hourly rate"
                                    className="h-14 p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385]"
                                />
                            </div> */}

                            <div className="space-y-2.5">
                                <Label className="text-base font-normal text-start">
                                    Rank
                                </Label>
                                <Select value={formData.rank} onValueChange={(value) => handleInputChange('rank', value)}>
                                    <SelectTrigger className="h-14 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385]">
                                        <SelectValue placeholder="Select Rank" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="novice">Novice</SelectItem>
                                        <SelectItem value="intermediate">Intermediate</SelectItem>
                                        <SelectItem value="advanced">Advanced</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Certifications
                            </Label>
                            <Textarea
                                value={formData.certifications}
                                onChange={(e) => handleInputChange('certifications', e.target.value)}
                                placeholder="List your certifications and qualifications..."
                                className="min-h-[100px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Bio
                            </Label>
                            <Textarea
                                value={formData.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                placeholder="Tell us about your coaching experience and philosophy..."
                                className="min-h-[120px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                            />
                        </div>

                        {/* <div className="space-y-2.5">
                            <Label className="text-base font-normal text-start">
                                Achievements
                            </Label>
                            <Textarea
                                value={formData.achievements}
                                onChange={(e) => handleInputChange('achievements', e.target.value)}
                                placeholder="List your achievements, awards, and notable accomplishments..."
                                className="min-h-[100px] p-5 bg-gray-50 rounded-[10px] border-0 text-base font-normal text-[#6B7385] placeholder:text-[#6B7385] resize-none"
                            />
                        </div> */}
                    </div>

                    {/* Coach Status */}
                    <div className="space-y-4 p-4 bg-yellow-50 rounded-[10px] border border-yellow-200">
                        <h4 className="text-base font-medium text-yellow-800 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Coach Status
                        </h4>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm text-yellow-700">
                                Your coach profile is being reviewed
                            </span>
                        </div>
                        <p className="text-sm text-yellow-600">
                            Once approved, you can start accepting bookings and coaching sessions.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-5 pt-5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            className="min-w-24 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-700 rounded-[10px] text-base font-medium"
                        >
                            Reset
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={detailLoading}
                            className={`min-w-36 px-6 py-3.5 ${detailLoading ? 'bg-gray-500 cursor-wait' : 'bg-gray-800 hover:bg-gray-900'} text-white rounded-[10px] text-base font-medium`}
                        >
                            {detailLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


