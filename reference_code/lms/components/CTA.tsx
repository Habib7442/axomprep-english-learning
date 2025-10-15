import Image from "next/image";
import Link from "next/link";
import React from "react";

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="cta-badge">Start Learning Your Way</div>
      <h2 className="text-3xl font-bold">
        Build and Personalize Your AI Tutor
      </h2>
      <p className="text-xl">
        Create a customized AI Tutor that matches your learning style
        and preferences.
      </p>
      <Image src="/images/cta.svg" alt="cta" width={362} height={232} />
      <button className="btn-primary">
        <Image src="/icons/plus.svg" alt="plus" width={12} height={12} />
        <Link href="/companions/new">
          <p>Build a new AI Tutor</p>
        </Link>
      </button>
    </section>
  );
};

export default CTA;