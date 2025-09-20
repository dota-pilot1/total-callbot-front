import { AdminHeader } from "../../admin/components";
import { MemberStatus } from "../components";

export function UserAdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      <AdminHeader title="회원 관리" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-8">
            <MemberStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
