import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/mongodb";
import Story from "@/models/Story";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectToDatabase();
  const story = (await Story.findOne({ userId: session.user.id }).lean()) as any;

  const serializedStory = story
    ? {
        ...JSON.parse(JSON.stringify(story)),
        _id: story._id.toString()
      }
    : null;

  return (
    <DashboardClient
      initialStory={serializedStory}
      user={{
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: session.user.role ?? "user"
      }}
    />
  );
}
