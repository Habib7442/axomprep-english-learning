import React from "react";
import CompanionForm from "@/components/CompanionForm";
import Image from "next/image";
import { newCompanionPermissions } from "@/lib/actions/companion.actions";

const NewCompanion = async () => {
  const canCreateCompanion = await newCompanionPermissions();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {canCreateCompanion ? (
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Tutor Builder</h1>
          <p className="text-gray-600 mb-8">
            Create your personalized AI Tutor for focused learning
          </p>
          <CompanionForm />
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-6">
            <Image
              src="/images/limit-reached.svg"
              alt="Companion limit reached"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <h2 className="text-2xl font-bold mb-4">AI Tutor Limit Reached</h2>
          <p className="text-gray-600 mb-6">
            You've reached the maximum number of AI Tutors for your current plan.
            Upgrade to create more AI Tutors and access premium features.
          </p>
          <button className="btn-primary">Upgrade Plan</button>
        </div>
      )}
    </div>
  );
};

export default NewCompanion;