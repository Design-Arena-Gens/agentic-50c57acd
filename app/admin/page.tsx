import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Story from "@/models/Story";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await connectToDatabase();

  const users = await User.find().lean();
  const stories = await Story.find().lean();

  const records = users.map((user) => {
    const story = stories.find((s) => s.userId.toString() === user._id.toString());
    return {
      id: user._id.toString(),
      name: user.name ?? "",
      email: user.email,
      role: user.role ?? "user",
      createdAt: user.createdAt?.toISOString() ?? "",
      lastStoryUpdate: story?.updatedAt?.toISOString() ?? "",
      timelineCount: story?.timeline?.length ?? 0,
      draftCount: story?.generatedDrafts?.length ?? 0
    };
  });

  return <AdminDashboardClient initialUsers={records} />;
}
