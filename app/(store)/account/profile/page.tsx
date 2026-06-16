"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { CalendarDays, Mail, Phone, UserRound, LogOut, ShieldCheck } from "lucide-react";
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

type ContactField = "email" | "phone";

type PendingVerificationState = Partial<
  Record<
    ContactField,
    {
      value: string;
      challengeToken: string;
    }
  >
>;

type VerifiedContactState = Partial<
  Record<
    ContactField,
    {
      value: string;
      verifiedToken: string;
    }
  >
>;

function normalizeEmailValue(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhoneValue(value: string) {
  return value.replace(/\s+/g, "").trim();
}

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
  const [pendingVerification, setPendingVerification] = useState<PendingVerificationState>({});
  const [verifiedContacts, setVerifiedContacts] = useState<VerifiedContactState>({});
  const [otpValues, setOtpValues] = useState<Partial<Record<ContactField, string>>>({});
  const [verifying, setVerifying] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
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
      setPendingVerification({});
      setVerifiedContacts({});
      setOtpValues({});
      setVerificationModalOpen(false);
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

    if (field === "email" || field === "phone") {
      setPendingVerification((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      setVerifiedContacts((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      setOtpValues((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const openEditorForField = (field: keyof ProfileData) => {
    setIsEditing(true);
    setStatusMessage("");
    setErrorMessage("");
    setFocusField(field);
  };

  const normalizedContactValue = (field: ContactField, source: ProfileData | null) => {
    const raw = source?.[field] || "";
    return field === "email" ? normalizeEmailValue(raw) : normalizePhoneValue(raw);
  };

  const changedContacts = useMemo(() => {
    const changed: ContactField[] = [];
    if (normalizedContactValue("email", form) !== normalizedContactValue("email", savedProfile)) {
      changed.push("email");
    }
    if (normalizedContactValue("phone", form) !== normalizedContactValue("phone", savedProfile)) {
      changed.push("phone");
    }
    return changed;
  }, [form, savedProfile]);

  const hasValidVerifiedTokenFor = (field: ContactField) =>
    verifiedContacts[field]?.value === normalizedContactValue(field, form) && Boolean(verifiedContacts[field]?.verifiedToken);

  const hasPendingVerificationFor = (field: ContactField) =>
    pendingVerification[field]?.value === normalizedContactValue(field, form) && Boolean(pendingVerification[field]?.challengeToken);

  const submitProfileUpdate = async (verifiedOverride?: VerifiedContactState) => {
    const verifiedState = verifiedOverride ?? verifiedContacts;
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        emailVerificationToken:
          verifiedState.email?.value === normalizedContactValue("email", form) ? verifiedState.email.verifiedToken : undefined,
        phoneVerificationToken:
          verifiedState.phone?.value === normalizedContactValue("phone", form) ? verifiedState.phone.verifiedToken : undefined
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Unable to update profile.");
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
    setPendingVerification({});
    setVerifiedContacts({});
    setOtpValues({});
    setVerificationModalOpen(false);
    setIsEditing(false);
    setStatusMessage("Profile saved successfully.");
  };

  const initiateContactVerification = async (fields: ContactField[]) => {
    const nextPending: PendingVerificationState = {};

    for (const field of fields) {
      const value = normalizedContactValue(field, form);
      if (!value) continue;

      const res = await fetch("/api/account/profile/contact/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: field, value })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Unable to send ${field} verification OTP.`);
      }

      nextPending[field] = {
        value,
        challengeToken: String(data.challengeToken || "")
      };
    }

    setPendingVerification((prev) => ({ ...prev, ...nextPending }));
    setVerificationModalOpen(true);
    setStatusMessage(
      fields.length > 1
        ? "OTPs sent to your updated contacts. Verify them to finish saving."
        : `OTP sent to verify your new ${fields[0]}.`
    );
  };

  const verifyContactsAndSave = async () => {
    const fieldsToVerify = changedContacts.filter((field) => hasPendingVerificationFor(field) && !hasValidVerifiedTokenFor(field));

    if (!fieldsToVerify.length) {
      return;
    }

    setVerifying(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const nextVerified: VerifiedContactState = { ...verifiedContacts };

      for (const field of fieldsToVerify) {
        const pending = pendingVerification[field];
        const otp = String(otpValues[field] || "").trim();

        if (!pending || !otp) {
          throw new Error(`Enter the OTP sent to your new ${field}.`);
        }

        const res = await fetch("/api/account/profile/contact/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: field,
            value: pending.value,
            otp,
            challengeToken: pending.challengeToken
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || `Unable to verify ${field}.`);
        }

        nextVerified[field] = {
          value: pending.value,
          verifiedToken: String(data.verifiedToken || "")
        };
      }

      setVerifiedContacts(nextVerified);
      await submitProfileUpdate(nextVerified);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to verify OTP.");
    } finally {
      setVerifying(false);
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");
    setErrorMessage("");
    try {
      const fieldsNeedingVerification = changedContacts.filter((field) => {
        const nextValue = normalizedContactValue(field, form);
        if (!nextValue) {
          return false;
        }
        return !hasValidVerifiedTokenFor(field);
      });

      if (fieldsNeedingVerification.length) {
        const fieldsToInitiate = fieldsNeedingVerification.filter((field) => !hasPendingVerificationFor(field));

        if (fieldsToInitiate.length) {
          await initiateContactVerification(fieldsToInitiate);
        } else {
          setVerificationModalOpen(true);
          setStatusMessage("Enter the OTP sent to your updated contact and then verify to finish saving.");
        }
        return;
      }

      await submitProfileUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update profile.";
      if (message.toLowerCase().includes("verify your new")) {
        setVerificationModalOpen(true);
      }
      setErrorMessage(message);
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
                setPendingVerification({});
                setVerifiedContacts({});
                setOtpValues({});
                setVerificationModalOpen(false);
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
                {saving ? "Saving..." : changedContacts.length ? "Save & Continue Verification" : "Save Profile"}
              </button>

              {savedProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setForm(savedProfile);
                    setIsEditing(false);
                    setStatusMessage("");
                    setErrorMessage("");
                    setPendingVerification({});
                    setVerifiedContacts({});
                    setOtpValues({});
                    setVerificationModalOpen(false);
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

      {verificationModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b1611]/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-[#dcc6a5] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f1e6_100%)] p-6 shadow-[0_24px_60px_rgba(48,33,17,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#8a6538] shadow-sm">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#8a6538]">Verify Contact Update</p>
                  <h3 className="mt-2 font-heading text-2xl text-royal-800">OTP verification required</h3>
                  <p className="mt-2 text-sm leading-6 text-royal-700/75">
                    Verify your updated contact details before we save them to your profile.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerificationModalOpen(false)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs uppercase tracking-[0.14em] text-royal-700"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {changedContacts.includes("email") ? (
                <div className="rounded-2xl border border-black/8 bg-white/85 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Email verification</p>
                  <p className="mt-1 text-sm font-medium text-royal-800">{form.email || "No email entered"}</p>
                  {hasValidVerifiedTokenFor("email") ? (
                    <p className="mt-3 text-xs font-medium text-emerald-700">Verified and ready to save.</p>
                  ) : pendingVerification.email ? (
                    <>
                      <input
                        value={otpValues.email || ""}
                        onChange={(event) => setOtpValues((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="Enter email OTP"
                        className="mt-3 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none placeholder:text-royal-700/35 focus:border-[#9c7346]/55"
                      />
                      <p className="mt-2 text-xs text-royal-700/65">
                        {"OTP sent to your updated email."}
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-royal-700/65">Save once to send OTP for this email.</p>
                  )}
                </div>
              ) : null}

              {changedContacts.includes("phone") ? (
                <div className="rounded-2xl border border-black/8 bg-white/85 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Phone verification</p>
                  <p className="mt-1 text-sm font-medium text-royal-800">{form.phone || "No phone entered"}</p>
                  {hasValidVerifiedTokenFor("phone") ? (
                    <p className="mt-3 text-xs font-medium text-emerald-700">Verified and ready to save.</p>
                  ) : pendingVerification.phone ? (
                    <>
                      <input
                        value={otpValues.phone || ""}
                        onChange={(event) => setOtpValues((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="Enter SMS OTP"
                        className="mt-3 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm text-royal-800 outline-none placeholder:text-royal-700/35 focus:border-[#9c7346]/55"
                      />
                      <p className="mt-2 text-xs text-royal-700/65">OTP sent to your updated phone number.</p>
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-royal-700/65">Save once to send OTP for this phone number.</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void verifyContactsAndSave();
                }}
                disabled={verifying}
                className="rounded-full bg-royal-800 px-5 py-2.5 text-sm font-medium tracking-[0.12em] text-white disabled:opacity-60"
              >
                {verifying ? "Verifying..." : "Verify OTP & Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  void initiateContactVerification(
                    changedContacts.filter((field) => {
                      const nextValue = normalizedContactValue(field, form);
                      return Boolean(nextValue) && !hasValidVerifiedTokenFor(field);
                    })
                  );
                }}
                className="rounded-full border border-black/12 bg-white px-5 py-2.5 text-sm text-royal-700 transition hover:border-royal-700"
              >
                Resend OTP
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {statusMessage ? <p className="text-sm text-emerald-700">{statusMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}
    </div>
  );
}
