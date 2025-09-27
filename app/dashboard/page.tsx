import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/signout-button";
import PasswordSetupCard from "@/components/dashboard/password-setup-card";
import Avatar from "@/components/ui/avatar";

export default async function DashboardPage() {
  const session = await auth();

  // If no session, redirect to home page
  if (!session) {
    redirect("/");
  }
  // If session exists, render the dashboard content directly
  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Avatar
              src={session.user?.image}
              name={session.user?.name || ""}
              size="lg"
            />
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-400">
                Welcome back, {session.user?.name}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* Account Security Section */}
        <div className="mb-8">
          <PasswordSetupCard />
        </div>

        {/* User Information Section */}
        <div className="bg-gray-900/50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">ID</p>
              <p className="text-white">{session.user?.id || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-400">Name</p>
              <p className="text-white">{session.user?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-400">Email</p>
              <p className="text-white">{session.user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-400">Role</p>
              <p className="text-white">{session.user?.role || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-400">Status</p>
              <p className="text-white">{session.user?.status || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-400">Country</p>
              <p className="text-white">{session.user?.country || "N/A"}</p>
            </div>
            <div>
              <p className="text-gray-400">Referral Code</p>
              <p className="text-white">
                {session.user?.referralCode || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Raw Session Data */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Raw Session Data</h2>
          <pre className="bg-gray-900/50 p-4 rounded overflow-x-auto text-sm text-green-400">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
