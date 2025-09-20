import { useUsersQuery } from "../lib/useUsersQuery";
import { useRealtimeUserStatus } from "../lib/useRealtimeUserStatus";
import { useAuthStore } from "../../auth";

export function UserManagementPage() {
  // 디버깅: 토큰 상태 확인
  const isAuthed = useAuthStore((s) => s.isAuthenticated());

  const { data: users, isLoading, isError, error } = useUsersQuery();
  const { isConnected } = useRealtimeUserStatus();

  // 프론트엔드 데이터 로깅
  console.log("=== 프론트엔드 사용자 데이터 ===", {
    usersCount: users?.length || 0,
    users: users,
    isLoading,
    isError,
    error: error?.message,
  });

  if (users) {
    users.forEach((user, index) => {
      console.log(
        `프론트 사용자 ${index + 1}: ID ${user.id} (${user.name}) - online: ${user.online} (타입: ${typeof user.online})`,
      );
    });
  }
  console.log("UserManagementPage 렌더링 시 토큰 상태:", {
    hasToken: isAuthed,
  });

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
          <strong>디버깅 정보:</strong>
          <br />
          토큰 존재: {isAuthed ? "✅ 있음" : "❌ 없음"}
        </div>
        Loading users...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4">
        <div className="mb-4 p-2 bg-red-100 rounded text-sm">
          <strong>디버깅 정보:</strong>
          <br />
          토큰 존재: {isAuthed ? "✅ 있음" : "❌ 없음"}
          <br />
          <strong>에러:</strong> {error?.message}
        </div>
        <div className="text-red-500">Error: {error?.message}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex items-center gap-2 text-sm">
          <span>실시간 연결:</span>
          <span
            className={`inline-block w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          ></span>
          <span className={isConnected ? "text-green-600" : "text-red-600"}>
            {isConnected ? "연결됨" : "연결 안됨"}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => {
              console.log(
                `렌더링 중 사용자 ${user.id} (${user.name}): online=${user.online}, 타입=${typeof user.online}, 조건결과=${user.online ? "온라인" : "오프라인"}`,
              );
              return (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">{user.id}</td>
                  <td className="py-2 px-4 border-b">{user.name}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${user.online ? "bg-green-500" : "bg-red-500"}`}
                      title={user.online ? "Online" : "Offline"}
                    ></span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
