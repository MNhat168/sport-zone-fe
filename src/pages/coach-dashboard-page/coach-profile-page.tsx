import { useEffect, useState } from "react";
import axiosPublic from "@/utils/axios/axiosPublic";
import { CoachDashboardTabs } from "@/components/ui/coach-dashboard-tabs"
import { NavbarDarkComponent } from "@/components/header/navbar-dark-component"
import { CoachDashboardHeader } from "@/components/header/coach-dashboard-header"
import { PageWrapper } from '@/components/layouts/page-wrapper'

interface CoachProfile {
  certification?: string;
  bio?: string;
  sports?: string[];
  location?: string;
  experience?: string;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [form, setForm] = useState<CoachProfile>({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;
      try {
        const res = await axiosPublic.get(`/profiles/user/${user._id}`);
        setProfile(res.data.data);
        setForm(res.data.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user?._id) return;

    try {
      const res = await axiosPublic.patch(`/profiles/coach/update/${user._id}`, form);
      setProfile(res.data.data);
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <>
      <NavbarDarkComponent />
      <PageWrapper>
        <CoachDashboardHeader />
        <CoachDashboardTabs />

        <div className="max-w-3xl mx-auto mt-8 bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Coach Profile</h2>

          {!editing ? (
            <div className="space-y-3">
              <p><strong>Certification:</strong> {profile?.certification || "N/A"}</p>
              <p><strong>Bio:</strong> {profile?.bio || "N/A"}</p>
              <p><strong>Sports:</strong> {profile?.sports?.join(", ") || "N/A"}</p>
              <p><strong>Location:</strong> {profile?.location || "N/A"}</p>
              <p><strong>Experience:</strong> {profile?.experience || "N/A"}</p>

              <button
                onClick={() => setEditing(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                name="certification"
                value={form.certification || ""}
                onChange={handleChange}
                placeholder="Certification"
                className="w-full border rounded-lg p-2"
              />
              <textarea
                name="bio"
                value={form.bio || ""}
                onChange={handleChange}
                placeholder="Bio"
                className="w-full border rounded-lg p-2"
              />
              <input
                type="text"
                name="sports"
                value={form.sports?.join(", ") || ""}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    sports: e.target.value.split(",").map(s => s.trim()),
                  }))
                }
                placeholder="Sports (comma-separated)"
                className="w-full border rounded-lg p-2"
              />
              <input
                type="text"
                name="location"
                value={form.location || ""}
                onChange={handleChange}
                placeholder="Location"
                className="w-full border rounded-lg p-2"
              />
              <input
                type="text"
                name="experience"
                value={form.experience || ""}
                onChange={handleChange}
                placeholder="Experience"
                className="w-full border rounded-lg p-2"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
};

