import CompanionComponent from "@/components/CompanionComponent";
import { getCompanion } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

interface CompanionSessionPageProps {
  params: Promise<{ id: string }>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
  const { id } = await params;
  const companion = await getCompanion(id);
  const user = await currentUser();

  const { topic, subject, name, duration } = companion;

  if (!user) redirect("/sign-in");
  if (!name) redirect("/companions");
  return (
    <main className="w-full px-4 md:px-8 py-6 md:py-8">
      <article className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="size-[80px] md:size-[90px] flex items-center justify-center rounded-xl"
              style={{ backgroundColor: getSubjectColor(subject) }}
            >
              <Image
                src={`/icons/${subject}.svg`}
                alt={subject}
                width={40}
                height={40}
                className="md:w-[45px] md:h-[45px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-bold text-2xl md:text-3xl text-[#1F2937]">{name}</h1>
                <div 
                  className="px-3 py-1 rounded-full text-sm font-semibold capitalize text-white"
                  style={{ backgroundColor: getSubjectColor(subject) }}
                >
                  {subject}
                </div>
              </div>
              <p className="text-lg md:text-xl text-[#4B5563]">{topic}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#FFF7F2] to-[#FEF3C7] rounded-2xl px-6 py-4 border border-[#FDE6D8]">
            <p className="text-lg md:text-xl font-semibold text-[#1F2937] flex items-center gap-2">
              <svg 
                className="w-6 h-6 text-[#FF6B35]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span>{duration} minutes</span>
            </p>
          </div>
        </div>
      </article>
      <CompanionComponent
        {...companion}
        companionId={id}
        userName={user.firstName!}
        userImage={user.imageUrl!}
        userId={user.id}
      />
    </main>
  );
};

export default CompanionSession;