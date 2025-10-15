import React from 'react';
import { PricingTable } from "@clerk/nextjs";
import Link from "next/link";

const Subscription = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#EEF2FF] via-[#F8F9FB] to-[#FEF3C7] py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#FF6B35] to-[#FF914D] bg-clip-text text-transparent">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-[#475569] max-w-2xl mx-auto">
                        Start building interview confidence with our AI-powered coaching platform
                    </p>
                </div>
                
                <div className="max-w-5xl mx-auto">
                    <PricingTable />
                </div>
                
                {/* Plan Features Comparison */}
                <div className="mt-16 max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 text-[#0F172A]">Plan Features Comparison</h2>
                    
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
                            {/* Features Column */}
                            <div className="border-r border-gray-200">
                                <div className="p-6 bg-gray-50 border-b border-gray-200">
                                    <h3 className="font-bold text-lg text-[#0F172A]">Features</h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    <div className="p-4">
                                        <p className="font-medium text-[#0F172A]">AI Tutors</p>
                                        <p className="text-sm text-gray-600">Create personalized AI tutors</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-[#0F172A]">Interview Practice</p>
                                        <p className="text-sm text-gray-600">Practice mock interviews</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-[#0F172A]">Resume Analysis</p>
                                        <p className="text-sm text-gray-600">Get feedback on your resume</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-[#0F172A]">Advanced Reporting</p>
                                        <p className="text-sm text-gray-600">Detailed performance analytics</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-[#0F172A]">Priority Support</p>
                                        <p className="text-sm text-gray-600">Get faster help</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Free Plan */}
                            <div>
                                <div className="p-6 bg-gray-50 border-b border-gray-200 text-center">
                                    <h3 className="font-bold text-lg text-[#0F172A]">Free</h3>
                                    <p className="text-2xl font-bold mt-2">$0<span className="text-sm font-normal text-gray-600">/month</span></p>
                                </div>
                                <div className="divide-y divide-gray-200 text-center">
                                    <div className="p-4">
                                        <p className="font-medium">1 Tutor</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium">2 Interviews/month</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-gray-400">-</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-gray-400">-</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-gray-400">-</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Basic Core Learner Plan */}
                            <div>
                                <div className="p-6 bg-blue-50 border-b border-gray-200 text-center">
                                    <h3 className="font-bold text-lg text-[#0F172A]">Basic Core Learner</h3>
                                    <p className="text-2xl font-bold mt-2">$10<span className="text-sm font-normal text-gray-600">/month</span></p>
                                </div>
                                <div className="divide-y divide-gray-200 text-center">
                                    <div className="p-4">
                                        <p className="font-medium">10 Tutors</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium">15 Interviews/month</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-green-600">✓</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-gray-400">-</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-gray-400">-</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Pro Companion Plan */}
                            <div>
                                <div className="p-6 bg-purple-50 border-b border-gray-200 text-center">
                                    <h3 className="font-bold text-lg text-[#0F172A]">Pro Companion</h3>
                                    <p className="text-2xl font-bold mt-2">$20<span className="text-sm font-normal text-gray-600">/month</span></p>
                                </div>
                                <div className="divide-y divide-gray-200 text-center">
                                    <div className="p-4">
                                        <p className="font-medium">50 Tutors</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium">Unlimited</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-green-600">✓</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-green-600">✓</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="font-medium text-green-600">✓</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Need help choosing a plan? <Link href="/contact" className="text-[#FF6B35] hover:underline">Contact us</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Subscription;