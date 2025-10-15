import { currentUser } from "@clerk/nextjs/server";
import InterviewClient from "@/app/interview/InterviewClient";
import { redirect } from "next/navigation";

const InterviewPage = async ({ searchParams }: { searchParams: Promise<{ topic?: string }> }) => {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const unwrappedParams = await searchParams;

  return (
    <div>
      <InterviewClient 
        user={{
          id: user.id,
          firstName: user.firstName,
          imageUrl: user.imageUrl
        }}
        initialTopic={unwrappedParams?.topic || ""}
      />
    </div>
  );
};

export default InterviewPage;