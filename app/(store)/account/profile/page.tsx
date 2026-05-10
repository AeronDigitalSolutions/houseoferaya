"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { CalendarDays, Mail, Phone, UserRound, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
};

const emptyProfile: ProfileData = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: ""
};

export default function ProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileData>(emptyProfile);
  const [savedProfile, setSavedProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [focusField, setFocusField] = useState<keyof ProfileData | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const dobInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/account/profile", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.message || "Unable to load profile.");
        return;
      }
      const nextForm = {
        name: data.user?.name || "",
        email: data.user?.email || "",
        phone: data.user?.phone || "",
        dateOfBirth: data.user?.dateOfBirth ? String(data.user.dateOfBirth).slice(0, 10) : ""
      };
      setForm(nextForm);
      setSavedProfile(nextForm);
      setSavedAt(data.user?.updatedAt || null);
      setIsEditing(!(data.user?.name && (data.user?.email || data.user?.phone)));
    } catch {
      setErrorMessage("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const formattedSavedAt = useMemo(() => {
    if (!savedAt) return "";
    const date = new Date(savedAt);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("en-IN");
  }, [savedAt]);

  const firstName = useMemo(() => {
    const source = (savedProfile?.name || form.name || "there").trim();
    return source.split(/\s+/)[0] || "there";
  }, [savedProfile?.name, form.name]);

  const hasMissing = useMemo(
    () => ({
      name: !savedProfile?.name,
      email: !savedProfile?.email,
      phone: !savedProfile?.phone,
      dateOfBirth: !savedProfile?.dateOfBirth
    }),
    [savedProfile]
  );

  useEffect(() => {
    if (!isEditing || !focusField) {
      return;
    }

    const inputMap: Record<keyof ProfileData, HTMLInputElement | null> = {
      name: nameInputRef.current,
      email: emailInputRef.current,
      phone: phoneInputRef.current,
      dateOfBirth: dobInputRef.current
    };

    const target = inputMap[focusField];
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setFocusField(null);
  }, [isEditing, focusField]);

  const onChangeField = (field: keyof ProfileData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openEditorForField = (field: keyof ProfileData) => {
    setIsEditing(true);
    setStatusMessage("");
    setErrorMessage("");
    setFocusField(field);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");
    setErrorMessage("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.message || "Unable to update profile.");
        return;
      }

      const next = {
        name: data.user?.name || "",
        email: data.user?.email || "",
        phone: data.user?.phone || "",
        dateOfBirth: data.user?.dateOfBirth ? String(data.user.dateOfBirth).slice(0, 10) : ""
      };

      setForm(next);
      setSavedProfile(next);
      setSavedAt(data.user?.updatedAt || new Date().toISOString());
      setIsEditing(false);
      setStatusMessage("Profile saved successfully.");
    } catch {
      setErrorMessage("Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return <div className="card p-6 text-sm text-royal-700/80">Loading profile...</div>;
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-royal-700/60">Account</p>
          <h1 className="font-heading text-3xl text-royal-800 sm:text-4xl">Hi, {firstName}</h1>
          <p className="text-sm text-royal-700/70">Profile</p>
        </div>

        <div className="flex items-center gap-2">
          {savedProfile && !isEditing ? (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setStatusMessage("");
                setErrorMessage("");
              }}
              className="rounded-full border border-black/12 bg-white px-4 py-2 text-xs uppercase tracking-[0.14em] text-royal-700 transition hover:border-royal-700"
            >
              Edit Profile
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white px-4 py-2 text-xs uppercase tracking-[0.14em] text-royal-700"
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </header>

      {savedProfile && !isEditing ? (
        <section className="card space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading text-2xl text-royal-800">Saved Details</h2>
            {formattedSavedAt ? <span className="text-xs text-royal-700/60">Updated: {formattedSavedAt}</span> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-[#fbf7f1] p-3">
              <p className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-royal-700/60">
                <UserRound size={13} />
                Full Name
              </p>
              <p className="text-sm font-medium text-royal-800">{savedProfile.name || "Not provided"}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#fbf7f1] p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-royal-700/60">
                  <Mail size={13} />
                  Email
                </p>
                {hasMissing.email ? (
                  <button
                    type="button"
                    onClick={() => openEditorForField("email")}
                    className="rounded-full border border-[#9c7346]/35 bg-[#f6ece0] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[#7f6039] transition hover:bg-[#f1e4d2]"
                  >
                    Update detail
                  </button>
                ) : null}
              </div>
              <p className="text-sm font-medium text-royal-800">{savedProfile.email || "Not provided"}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#fbf7f1] p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-royal-700/60">
                  <Phone size={13} />
                  Phone
                </p>
                {hasMissing.phone ? (
                  <button
                    type="button"
                    onClick={() => openEditorForField("phone")}
                    className="rounded-full border border-[#9c7346]/35 bg-[#f6ece0] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[#7f6039] transition hover:bg-[#f1e4d2]"
                  >
                    Update detail
                  </button>
                ) : null}
              </div>
              <p className="text-sm font-medium text-royal-800">{savedProfile.phone || "Not provided"}</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-[#fbf7f1] p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-royal-700/60">
                  <CalendarDays size={13} />
                  Date of Birth
                </p>
                {hasMissing.dateOfBirth ? (
                  <button
                    type="button"
                    onClick={() => openEditorForField("dateOfBirth")}
                    className="rounded-full border border-[#9c7346]/35 bg-[#f6ece0] px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-[#7f6039] transition hover:bg-[#f1e4d2]"
                  >
                    Update detail
                  </button>
                ) : null}
              </div>
              <p className="text-sm font-medium text-royal-800">{savedProfile.dateOfBirth || "Not provided"}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="card space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="font-heading text-2xl text-royal-800">Edit Profile</h2>
            <p className="mt-1 text-sm text-royal-700/70">Save your details for quicker checkout and smoother account access.</p>
          </div>

          <form className="space-y-3" onSubmit={saveProfile}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Full Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => onChangeField("name", event.target.value)}
                  ref={nameInputRef}
                  className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none placeholder:text-royal-700/35 focus:border-[#9c7346]/55"
                  placeholder="Enter full name"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => onChangeField("email", event.target.value)}
                  ref={emailInputRef}
                  className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none placeholder:text-royal-700/35 focus:border-[#9c7346]/55"
                  placeholder="you@example.com"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Phone</span>
                <input
                  value={form.phone}
                  onChange={(event) => onChangeField("phone", event.target.value)}
                  ref={phoneInputRef}
                  className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none placeholder:text-royal-700/35 focus:border-[#9c7346]/55"
                  placeholder="+91XXXXXXXXXX"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Date of Birth</span>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) => onChangeField("dateOfBirth", event.target.value)}
                  ref={dobInputRef}
                  className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none focus:border-[#9c7346]/55"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-royal-800 px-5 py-2.5 text-sm font-medium tracking-[0.12em] text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>

              {savedProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setForm(savedProfile);
                    setIsEditing(false);
                    setStatusMessage("");
                    setErrorMessage("");
                  }}
                  className="rounded-full border border-black/12 bg-white px-5 py-2.5 text-sm text-royal-700 transition hover:border-royal-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>
      )}

      {statusMessage ? <p className="text-sm text-emerald-700">{statusMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
    </div>
  );
}
