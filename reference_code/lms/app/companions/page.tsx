import CompanionCard from "@/components/CompanionCard";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import { getAllCompanions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import React from "react";

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
  const filters = await searchParams;
  const subject = filters.subject ? filters.subject : "";
  const topic = filters.topic ? filters.topic : "";

  try {
    const companions = await getAllCompanions({ subject, topic });
    console.log(companions, "companions");

    if (!companions) {
      return <div>No AI Tutors found.</div>;
    }

    return (
      <div className="bg-[#F8F9FB] min-h-screen">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Header Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-4">
                AI Tutor Library
              </h1>
              <p className="text-xl text-[#475569] max-w-2xl mx-auto">
                Explore our collection of AI tutors tailored to help you master
                any subject
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 justify-center items-center max-w-3xl mx-auto">
              <div className="flex-1">
                <SearchInput />
              </div>
              <div className="w-48">
                <SubjectFilter />
              </div>
            </div>
          </div>

          {/* Companions Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-8">
            {companions.map((companion) => (
              <CompanionCard
                key={companion.id}
                {...companion}
                color={getSubjectColor(companion.subject)}
              />
            ))}
          </section>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching AI Tutors:", error);
    return (
      <div className="bg-[#F8F9FB] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
            Error loading AI Tutors
          </h2>
          <p className="text-[#64748B]">Please try again later</p>
        </div>
      </div>
    );
  }
};

export default CompanionsLibrary;
