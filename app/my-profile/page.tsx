"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Award, Star, ShieldCheck, Wrench, Plus, X, User } from "lucide-react";
import { Button } from "@/components/Button";
import { CATEGORIES } from "@/lib/constants";
import { getUserProfile, updateUserProfile } from "@/actions/repairRequest";
import { toast } from "sonner";
import { HashLoader } from "react-spinners";

const DEFAULT_SPECIALTIES = ["phone", "laptop"];

export default function MyProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [specialties, setSpecialties] = useState<string[]>(DEFAULT_SPECIALTIES);
  const [newSpecialty, setNewSpecialty] = useState("");

  const isTechnician = session?.user?.role === "Technician";

  useEffect(() => {
    if (session) {
      setLoadingDb(true);
      getUserProfile()
        .then((res) => {
          if (res.success && res.profile) {
            setProfile(res.profile);
            setBusinessName(res.profile.businessName || "");
            setAvatarUrl(res.profile.avatar || "");
            setSpecialties(res.profile.specialties || []);
          } else {
            toast.error(res.message || "Failed to load profile details.");
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error loading profile.");
        })
        .finally(() => {
          setLoadingDb(false);
        });
    } else if (status !== "loading") {
      setLoadingDb(false);
    }
  }, [session, status]);

  const displayName = useMemo(() => {
    if (!session?.user) return "User";
    if (isTechnician) return businessName || profile?.name || session.user.name || "Technician";
    return profile?.name || session.user.name || "Customer";
  }, [isTechnician, session?.user, businessName, profile]);

  const addSpecialty = async () => {
    const value = newSpecialty.trim();
    if (!value || specialties.includes(value)) return;
    const updated = [...specialties, value];
    setSpecialties(updated);
    setNewSpecialty("");

    const res = await updateUserProfile({ specialties: updated });
    if (res.success) {
      toast.success("Specialty added successfully!");
    } else {
      toast.error(res.message || "Failed to add specialty.");
    }
  };

  const removeSpecialty = async (value: string) => {
    const updated = specialties.filter((item) => item !== value);
    setSpecialties(updated);

    const res = await updateUserProfile({ specialties: updated });
    if (res.success) {
      toast.success("Specialty removed successfully!");
    } else {
      toast.error(res.message || "Failed to remove specialty.");
    }
  };

  const handleSaveBusinessName = async () => {
    setIsSaving(true);
    const res = await updateUserProfile({ businessName });
    if (res.success) {
      toast.success("Business name saved successfully!");
      if (res.profile) {
        setProfile(res.profile);
      }
    } else {
      toast.error(res.message || "Failed to save business name.");
    }
    setIsSaving(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarUrl(base64);

      setIsSaving(true);
      const res = await updateUserProfile({ avatar: base64 });
      if (res.success) {
        toast.success("Avatar uploaded and saved successfully!");
        if (res.profile) {
          setProfile(res.profile);
        }
      } else {
        toast.error(res.message || "Failed to upload avatar.");
      }
      setIsSaving(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    setIsSaving(true);
    setAvatarUrl("");
    const res = await updateUserProfile({ avatar: "" });
    if (res.success) {
      toast.success("Avatar picture removed.");
      if (res.profile) {
        setProfile(res.profile);
      }
    } else {
      toast.error(res.message || "Failed to remove avatar picture.");
    }
    setIsSaving(false);
  };

  if (status === "loading" || loadingDb) {
    return (
      <div className="min-h-screen bg-deepCarbon flex flex-col items-center justify-center text-softGray gap-4">
        <HashLoader color="#26fff2" size={50} />
        <span className="text-sm font-medium tracking-wide">Loading profile...</span>
      </div>
    );
  }

  if (!session) {
    router.push("/sign-in?callbackUrl=/my-profile");
    return null;
  }

  return (
    <div className="min-h-screen bg-deepCarbon px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="rounded-2xl border border-slateSteel bg-gunmetal/80 p-6 shadow-[0_0_50px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-electricAqua/40 bg-deepCarbon overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIconFallback />
                )}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-softGray">My Profile</p>
                <h1 className="font-display text-3xl font-bold text-white">{displayName}</h1>
                <p className="text-softGray">{session.user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-4">
              <StatCard label="Rating" value={(profile?.rating ?? 4.5).toString()} icon={<Star className="h-4 w-4" />} />
              <StatCard label="Reviews" value={(profile?.reviewCount ?? 0).toString()} icon={<Award className="h-4 w-4" />} />
              <StatCard label="Jobs" value={(profile?.completedRepairs ?? 0).toString()} icon={<Wrench className="h-4 w-4" />} />
              <StatCard label="Verified" value={profile?.verified ? "Yes" : "No"} icon={<ShieldCheck className="h-4 w-4" />} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slateSteel bg-gunmetal p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-white">Account Details</h2>
            <div className="space-y-4 text-sm">
              <InfoRow label="Name" value={profile?.name || session.user?.name || "-"} />
              <InfoRow label="Email" value={profile?.email || session.user?.email || "-"} />
              <InfoRow label="Role" value={profile?.role || session.user?.role || "-"} />
              <InfoRow label="Business Name" value={session.user?.role === "Technician" ? (businessName || "Not set") : "Customer account"} />
            </div>

            {isTechnician && (
              <div className="mt-6 space-y-3">
                <label className="text-xs font-medium uppercase tracking-wider text-softGray">Business Name</label>
                <div className="flex gap-3">
                  <input
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="Your business name"
                    className="w-full rounded border border-slateSteel bg-deepCarbon px-3 py-3 text-white outline-none transition-colors focus:border-electricAqua"
                  />
                  <Button type="button" variant="outline" onClick={() => setBusinessName(profile?.businessName || "")}>Reset</Button>
                  <Button type="button" onClick={handleSaveBusinessName} disabled={isSaving}>Save</Button>
                </div>
                <p className="text-xs text-softGray">This name is shown in the navbar for technician accounts.</p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-softGray">Upload Profile Picture</label>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSaving}
                  className="w-full text-sm text-softGray file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-electricAqua/20 file:text-electricAqua hover:file:bg-electricAqua/30 file:cursor-pointer bg-deepCarbon border border-slateSteel rounded p-2 focus:border-electricAqua outline-none focus:outline-none transition-colors"
                />
                {avatarUrl && (
                  <div>
                    <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={isSaving}>
                      Remove Picture
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-softGray">Select a picture file from your device (Max 2MB).</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slateSteel bg-gunmetal p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-white">Specialities</h2>
            <div className="mb-4 flex flex-wrap gap-2">
              {specialties.map((item) => {
                const category = CATEGORIES.find((entry) => entry.id === item);
                return (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-electricAqua/30 bg-deepCarbon px-3 py-1 text-sm text-softGray">
                    {category?.label || item}
                    {isTechnician && (
                      <button type="button" onClick={() => removeSpecialty(item)} className="text-errorRed hover:text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>

            {isTechnician ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    value={newSpecialty}
                    onChange={(event) => setNewSpecialty(event.target.value)}
                    placeholder="Add specialty e.g. phone"
                    className="w-full rounded border border-slateSteel bg-deepCarbon px-3 py-3 text-white outline-none transition-colors focus:border-electricAqua"
                  />
                  <Button type="button" onClick={addSpecialty} className="shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={async () => {
                        if (specialties.includes(category.id)) return;
                        const updated = [...specialties, category.id];
                        setSpecialties(updated);
                        const res = await updateUserProfile({ specialties: updated });
                        if (res.success) {
                          toast.success("Specialty added successfully!");
                        } else {
                          toast.error(res.message || "Failed to add specialty.");
                        }
                      }}
                      className="rounded-lg border border-slateSteel bg-deepCarbon px-3 py-2 text-left text-sm text-softGray transition-colors hover:border-electricAqua hover:text-white"
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-softGray">Customer accounts do not manage specialties.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIconFallback() {
  return <User className="h-7 w-7 text-electricAqua" />;
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slateSteel bg-deepCarbon px-4 py-3 text-left">
      <div className="mb-2 flex items-center gap-2 text-softGray">
        {icon}
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slateSteel/70 pb-3 last:border-b-0 last:pb-0">
      <span className="text-softGray">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );
}