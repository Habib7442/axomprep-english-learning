import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ResumeInterviewClient from "./ResumeInterviewClient";

const ResumeInterviewPage = async () => {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <ResumeInterviewClient 
      user={{
        id: user.id,
        firstName: user.firstName,
        imageUrl: user.imageUrl
      }}
    />
  );
};

export default ResumeInterviewPage;