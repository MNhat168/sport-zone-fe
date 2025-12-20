import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface CoachingSectionProps {
  coachingSummary: string;
  isEditMode: boolean;
  onCoachingSummaryChange: (value: string) => void;
  certification?: string;
  experienceText?: string;
  onCertificationChange?: (value: string) => void;
  onExperienceChange?: (value: string) => void;
  rank?: string;
  sports?: string[];
  onRankChange?: (value: string) => void;
  onSportsChange?: (value: string[]) => void;
}

export function CoachingSection({
  coachingSummary,
  isEditMode,
  onCoachingSummaryChange,
  certification,
  experienceText,
  onCertificationChange,
  onExperienceChange,
  rank,
  sports,
  onRankChange,
  onSportsChange,
}: CoachingSectionProps) {
  const [cert, setCert] = useState<string>(certification ?? "");
  const [exp, setExp] = useState<string>(experienceText ?? "");
  const [localRank, setLocalRank] = useState<string>(rank ?? "");
  const [localSports, setLocalSports] = useState<string[]>(sports ?? []);

  useEffect(() => {
    setCert(certification ?? "");
  }, [certification]);

  useEffect(() => {
    setExp(experienceText ?? "");
  }, [experienceText]);
  useEffect(() => {
    setLocalRank(rank ?? "");
  }, [rank]);
  useEffect(() => {
    setLocalSports(sports ?? []);
  }, [sports]);
  return (
    <Card
      id="coaching"
      className="shadow-md hover:shadow-lg transition-all duration-300 scroll-mt-24"
    >
      <CardHeader>
        <CardTitle className="text-xl text-left">
          Tóm tắt về huấn luyện viên
        </CardTitle>
        <hr className="my-2 border-gray-200" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mt-0 space-y-4 text-left">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="font-bold text-sm w-36">Certification:</label>
              {isEditMode ? (
                <Input
                  value={cert}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCert(v);
                    if (typeof (onCertificationChange as any) === "function") (onCertificationChange as any)(v);
                  }}
                  placeholder="ITF Level 3 Coach"
                />
              ) : (
                <span className="text-sm">{certification ?? "Không có"}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="font-bold text-sm w-36">Experience:</label>
              {isEditMode ? (
                <Input
                  value={exp}
                  onChange={(e) => {
                    const v = e.target.value;
                    setExp(v);
                    if (typeof (onExperienceChange as any) === "function") (onExperienceChange as any)(v);
                  }}
                  placeholder="10 years coaching experience"
                />
              ) : (
                <span className="text-sm">{experienceText ?? "Chưa cập nhật"}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="font-bold text-sm w-36">Rank:</label>
              {isEditMode ? (
                <select
                  value={localRank}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLocalRank(v);
                    if (typeof onRankChange === 'function') onRankChange(v);
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value="">Select rank</option>
                  <option value="novice">Novice</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="pro">Pro</option>
                </select>
              ) : (
                <span className="text-sm">{rank ?? "-"}</span>
              )}
            </div>

            <div className="flex items-start gap-3">
              <label className="font-bold text-sm w-36">Sports:</label>
              {isEditMode ? (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'football',
                    'basketball',
                    'tennis',
                    'badminton',
                    'swimming',
                    'volleyball',
                    'pickleball',
                    'gym',
                  ].map((s) => {
                    const checked = localSports.includes(s);
                    return (
                      <label key={s} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          value={s}
                          checked={checked}
                          onChange={(e) => {
                            const next = checked ? localSports.filter(x => x !== s) : [...localSports, s];
                            setLocalSports(next);
                            if (typeof onSportsChange === 'function') onSportsChange(next);
                          }}
                          className="w-4 h-4"
                        />
                        <span className="capitalize">{s}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <span className="text-sm">{(sports && sports.length) ? sports.join(', ') : '-'}</span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="link"
          className="text-green-600 hover:text-green-700 p-0 h-auto"
        >
          Xem thêm
        </Button>
      </CardContent>
    </Card>
  );
}

