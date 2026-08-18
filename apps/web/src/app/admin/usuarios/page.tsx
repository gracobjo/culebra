import { listUsersForAdmin } from "@culebra/auth";
import type { AdminUserRecord } from "@culebra/auth";
import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { formatDate } from "@/lib/format";
import { updateUserStatusAction } from "@/app/admin/actions";

export const metadata = { title: "Usuarios | Admin" };

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listUsersForAdmin();

  return (
    <AdminShell title="Usuarios">
      <ul className="space-y-3">
        {users.items.map((user: AdminUserRecord) => (
          <li key={user.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-stone-500">
                  {user.roles.join(", ")} · {user.status}
                  {user.vendorTradeName ? ` · ${user.vendorTradeName}` : ""} ·{" "}
                  {formatDate(user.createdAt)}
                </p>
              </div>
              {user.status === "SUSPENDED" ? (
                <form action={updateUserStatusAction.bind(null, user.id)}>
                  <input type="hidden" name="status" value="ACTIVE" />
                  <button type="submit" className="rounded-full border border-stone-300 px-3 py-2 text-sm">
                    Reactivar
                  </button>
                </form>
              ) : (
                <form action={updateUserStatusAction.bind(null, user.id)}>
                  <input type="hidden" name="status" value="SUSPENDED" />
                  <button type="submit" className="rounded-full border border-stone-300 px-3 py-2 text-sm">
                    Suspender
                  </button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
