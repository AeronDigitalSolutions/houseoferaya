"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ShieldCheck, UserPlus, X } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  adminPermissionKeys,
  defaultAdminPermissions,
  type AdminPermissionKey,
  type AdminPermissionSet
} from "@/lib/auth/admin-permissions";

type AdminRecord = {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  isActive: boolean;
  mustResetPassword: boolean;
  permissions: AdminPermissionSet;
  createdAt: string;
};

type AdminMeResponse = {
  success: boolean;
  admin?: {
    id: string;
    role: "SUPER_ADMIN" | "ADMIN";
    permissions: AdminPermissionSet;
  };
};

const permissionMeta: Record<AdminPermissionKey, string> = {
  canViewDashboard: "Dashboard access",
  canViewProducts: "View products",
  canEditProducts: "Edit products",
  canViewOrders: "View orders",
  canViewShipments: "View shipments",
  canViewPayments: "View payments",
  canViewPricing: "View pricing updates",
  canViewCustomers: "View customers",
  canManageHomepageMedia: "Manage homepage media",
  canManageAdmins: "Manage admins"
};

function ModalShell({
  title,
  subtitle,
  onClose,
  children
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4 py-6" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-3xl border border-stone-200 bg-[#f8f5f0] p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-2xl text-stone-900">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-stone-600">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function AdminAccessManager() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [viewerRole, setViewerRole] = useState<"SUPER_ADMIN" | "ADMIN">("ADMIN");
  const [viewerPermissions, setViewerPermissions] = useState<AdminPermissionSet>(defaultAdminPermissions);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newAdminPermissions, setNewAdminPermissions] = useState<AdminPermissionSet>(defaultAdminPermissions);

  const [selectedAdmin, setSelectedAdmin] = useState<AdminRecord | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<AdminPermissionSet>(defaultAdminPermissions);
  const [selectedIsActive, setSelectedIsActive] = useState(true);

  const canManageAdmins = viewerRole === "SUPER_ADMIN" || viewerPermissions.canManageAdmins;

  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const [meRes, usersRes] = await Promise.all([
        fetch("/api/admin/auth/me", { cache: "no-store" }),
        fetch("/api/admin/users", { cache: "no-store" })
      ]);
      const meData = (await meRes.json()) as AdminMeResponse;
      if (meData.admin) {
        setViewerRole(meData.admin.role);
        setViewerPermissions(meData.admin.permissions);
      }

      const usersData = (await usersRes.json()) as {
        success: boolean;
        users?: AdminRecord[];
        message?: string;
      };
      if (!usersRes.ok) {
        setMessage({ type: "error", text: usersData.message || "Failed to load admins." });
      } else {
        setAdmins(usersData.users || []);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load admin data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const adminCount = useMemo(() => admins.filter((admin) => admin.role === "ADMIN").length, [admins]);

  const createAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManageAdmins) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          permissions: newAdminPermissions
        })
      });
      const payload = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok) {
        setMessage({ type: "error", text: payload.message || "Unable to create admin." });
        return;
      }
      setMessage({ type: "success", text: "Admin created successfully." });
      setName("");
      setEmail("");
      setPassword("");
      setNewAdminPermissions(defaultAdminPermissions);
      setCreateModalOpen(false);
      await fetchData();
    } catch {
      setMessage({ type: "error", text: "Unable to create admin." });
    } finally {
      setSaving(false);
    }
  };

  const openAdminDetails = (admin: AdminRecord) => {
    setSelectedAdmin(admin);
    setSelectedPermissions(admin.permissions);
    setSelectedIsActive(admin.isActive);
    setDetailsModalOpen(true);
  };

  const saveSelectedAdmin = async () => {
    if (!selectedAdmin || !canManageAdmins || selectedAdmin.role === "SUPER_ADMIN") return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/users/${selectedAdmin.id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permissions: selectedPermissions,
          isActive: selectedIsActive
        })
      });
      const payload = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok) {
        setMessage({ type: "error", text: payload.message || "Unable to update permissions." });
        return;
      }
      setMessage({ type: "success", text: `Permissions updated for ${selectedAdmin.name}.` });
      setDetailsModalOpen(false);
      await fetchData();
    } catch {
      setMessage({ type: "error", text: "Unable to update permissions." });
    } finally {
      setSaving(false);
    }
  };

  const resetAdminPassword = async () => {
    if (!selectedAdmin || !canManageAdmins || selectedAdmin.role === "SUPER_ADMIN") return;

    const newPassword = window.prompt(`Set new password for ${selectedAdmin.name} (min 8 chars):`);
    if (!newPassword) return;
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/users/${selectedAdmin.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword })
      });
      const payload = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok) {
        setMessage({ type: "error", text: payload.message || "Unable to reset password." });
        return;
      }
      setMessage({ type: "success", text: "Admin password reset successful." });
      setDetailsModalOpen(false);
      await fetchData();
    } catch {
      setMessage({ type: "error", text: "Unable to reset password." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-3xl text-stone-900 sm:text-4xl">Admin Access Control</h2>
            <p className="mt-1 text-sm text-stone-600">
              Super Admin can create admin accounts and control tab-level permissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-700">
              Active Admins: <span className="font-semibold text-stone-900">{adminCount}</span>
            </div>
            {canManageAdmins ? (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white"
              >
                <UserPlus size={16} />
                Create Admin
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <section className="card rounded-3xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-stone-700" />
          <h3 className="font-heading text-2xl text-stone-900">Admins List</h3>
        </div>

        {loading ? (
          <p className="text-sm text-stone-600">Loading admin accounts...</p>
        ) : admins.length === 0 ? (
          <p className="text-sm text-stone-600">No admins found.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <div className="hidden grid-cols-[1.3fr_1.2fr_0.8fr_0.9fr_1fr] gap-4 border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs uppercase tracking-[0.16em] text-stone-500 md:grid">
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Created</span>
            </div>

            <div className="divide-y divide-stone-200">
              {admins.map((admin) => (
                <button
                  key={admin.id}
                  type="button"
                  onClick={() => openAdminDetails(admin)}
                  className="grid w-full gap-2 px-4 py-4 text-left transition hover:bg-stone-50 md:grid-cols-[1.3fr_1.2fr_0.8fr_0.9fr_1fr] md:gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900">{admin.name}</p>
                    <p className="text-xs text-stone-500 md:hidden">{admin.email}</p>
                  </div>
                  <p className="hidden text-sm text-stone-700 md:block">{admin.email}</p>
                  <p className="text-sm text-stone-700">{admin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</p>
                  <p>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                        admin.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                  <p className="text-xs text-stone-500">{new Date(admin.createdAt).toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {message ? (
        <p className={`text-sm ${message.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</p>
      ) : null}

      {createModalOpen ? (
        <ModalShell
          title="Create Admin"
          subtitle="Create a team admin and define what they can view or edit."
          onClose={() => setCreateModalOpen(false)}
        >
          <form className="space-y-4" onSubmit={createAdmin}>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Admin name"
                required
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-stone-500"
              />
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="admin@company.com"
                required
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-stone-500"
              />
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Temporary password"
                required
                autoComplete="new-password"
                inputClassName="rounded-xl border-stone-300 py-2.5 text-sm outline-none focus:border-stone-500 focus:ring-0"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {adminPermissionKeys.map((key) => (
                <label key={key} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newAdminPermissions[key]}
                    onChange={(event) =>
                      setNewAdminPermissions((prev) => ({
                        ...prev,
                        [key]: event.target.checked
                      }))
                    }
                  />
                  <span>{permissionMeta[key]}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {detailsModalOpen && selectedAdmin ? (
        <ModalShell
          title={`${selectedAdmin.name} Permissions`}
          subtitle={`${selectedAdmin.email} • ${selectedAdmin.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}`}
          onClose={() => setDetailsModalOpen(false)}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                  selectedIsActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {selectedIsActive ? "Active" : "Inactive"}
              </span>

              {selectedAdmin.role !== "SUPER_ADMIN" && canManageAdmins ? (
                <button
                  type="button"
                  onClick={() => setSelectedIsActive((prev) => !prev)}
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-700"
                >
                  {selectedIsActive ? "Mark Inactive" : "Mark Active"}
                </button>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {adminPermissionKeys.map((key) => (
                <label
                  key={`${selectedAdmin.id}-${key}`}
                  className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions[key]}
                    disabled={selectedAdmin.role === "SUPER_ADMIN" || !canManageAdmins}
                    onChange={(event) =>
                      setSelectedPermissions((prev) => ({
                        ...prev,
                        [key]: event.target.checked
                      }))
                    }
                  />
                  <span>{permissionMeta[key]}</span>
                </label>
              ))}
            </div>

            <div className="flex flex-wrap justify-between gap-2">
              <div>
                {selectedAdmin.role !== "SUPER_ADMIN" && canManageAdmins ? (
                  <button
                    type="button"
                    onClick={resetAdminPassword}
                    className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700"
                  >
                    Reset Password
                  </button>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  Close
                </button>
                {selectedAdmin.role !== "SUPER_ADMIN" && canManageAdmins ? (
                  <button
                    type="button"
                    onClick={saveSelectedAdmin}
                    disabled={saving}
                    className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
