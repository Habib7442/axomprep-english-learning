import React from "react";
import Link from "next/link";

interface ComingSoonProps {
  className: string;
  title: string;
  description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ className, title, description }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Classes
          </Link>
          <h1 className="text-3xl font-bold mt-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50 rounded-lg p-12">
        <div className="text-6xl mb-6">⏳</div>
        <h2 className="text-3xl font-bold mb-4">Coming Soon!</h2>
        <p className="text-xl text-gray-600 mb-8 text-center max-w-2xl">
          We&apos;re working hard to bring you the complete curriculum for {className}. 
          This feature will be available soon.
        </p>
        <Link href="/">
          <button className="btn-primary">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;