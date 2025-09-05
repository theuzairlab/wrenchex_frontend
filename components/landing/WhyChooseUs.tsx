'use client';

import React from 'react';
import {
    Wrench,
    Shield,
    Users,
    Settings,
    Award,
} from 'lucide-react';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import Link from 'next/link';
import { Button } from '../ui/Button';

interface GridItemProps {
    area: string;
    icon?: React.ReactNode;
    title: string;
    description: string;
    bgColor?: string;
    textColor?: string;
    imgSrc?: string;
    isCTA?: boolean;
}

const GridItem = ({ area, icon, title, description, bgColor = "bg-white", textColor = "text-wrench-text-primary", imgSrc, isCTA = false }: GridItemProps) => {
    return (
        <li className={`min-h-[14rem] list-none ${area}`}>
            <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                />
                <div className={`border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 ${bgColor} shadow-wrench-card`}>
                    {isCTA ? (
                        // CTA Section Layout
                        <div className="relative flex flex-1 flex-col justify-center items-center text-center space-y-4">
                            <div className="space-y-4">
                                <h3 className={`text-2xl sm:text-3xl font-bold ${textColor}`}>
                                    {title}
                                </h3>
                                <p className={`text-base sm:text-lg max-w-2xl mx-auto ${textColor} opacity-80`}>
                                    {description}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link href="/services">
                                    <Button variant="primary" >
                                        Book Service Now
                                    </Button>
                                </Link>
                                <Link href="/products">
                                    <Button variant="link">
                                        View Products
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        // Regular Card Layout
                        <div className="relative flex flex-1 flex-col justify-between gap-3">
                            {icon && (
                                <div className={`w-fit rounded-lg border ${textColor === 'text-white' ? 'border-white/65' : 'border-gray-700'} p-2`}>
                                    {icon}
                                </div>
                            )}
                            {imgSrc && (
                                <img src={imgSrc} alt="" className='w-full h-full object-cover rounded-lg border border-gray-700' />
                            )}
                            <div className="space-y-3">
                                <h3 className={`-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance md:text-2xl/[1.875rem] ${textColor}`}>
                                    {title}
                                </h3>
                                <p className={`font-sans text-sm/[1.125rem] md:text-base/[1.375rem] ${textColor} opacity-80 [&_b]:md:font-semibold [&_strong]:md:font-semibold`}>
                                    {description}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
};

export function WhyChooseUs() {
    return (
        <section className="py-4 sm:py-10 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-4 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-wrench-text-primary mb-4 sm:mb-6">
                        Best Auto Workshop In Your Area
                    </h2>
                    <p className="text-wrench-text-secondary text-base sm:text-lg max-w-4xl mx-auto leading-relaxed">
                    WrenchEX is a leading auto workshop specializing in hybrid and 
                    conventional vehicles. With expert mechanics and modern tools, 
                    we deliver reliable on-site maintenance and the best service experience.
                    </p>
                </div>

                {/* Aceternity UI Grid */}
                <div className="mb-4 sm:mb-16">
                    <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-4 lg:gap-4 xl:grid-rows-3">
                        <GridItem
                            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                            icon={<Settings className="h-4 w-4 text-black" />}
                            title="Best Equipment"
                            description="We've invested in the most up-to-date diagnostic equipment, tools and software designed particularly for your vehicle needs."
                            bgColor="bg-wrench-accent"
                            textColor="text-black"
                        />

                        <GridItem
                            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
                            icon={<Award className="h-4 w-4 text-wrench-text-primary" />}
                            title="Professional Standards"
                            description="Our car repair facility can work on a wide range of vehicles. We only conduct the work that is required to resolve your issue."
                        />

                        <GridItem
                            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
                            // icon={<Users className="h-4 w-4 text-wrench-text-primary" />}
                            title="Expert & Professional Team"
                            description="We are one of the leading auto workshop serving customers. All mechanical work performed by expert mechanics."
                            imgSrc="car-service.webp"
                        />

                        <GridItem
                            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
                            icon={<Wrench className="h-4 w-4 text-wrench-text-primary" />}
                            title="Full Auto Servicing Facility"
                            description="From fine-tuning engines to tackling major repairs, our Full Auto Servicing Facility ensures your vehicle runs smoothly every mile."
                        />

                        <GridItem
                            area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
                            icon={<Shield className="h-4 w-4 text-wrench-accent" />}
                            title="Genuine Parts Available"
                            description="Find peace of mind knowing that only genuine parts are available at our garage. Quality guaranteed for all repairs."
                            bgColor="bg-indigo-600"
                            textColor="text-white"
                        />

                        {/* CTA Section as GridItem */}
                        <GridItem
                            area="md:[grid-area:4/1/5/13] xl:[grid-area:3/1/4/13]"
                            title="Ready to Experience the Best Auto Service?"
                            description="Join thousands of satisfied customers who trust us with their vehicle maintenance and repairs."
                            bgColor="bg-white"
                            textColor="text-wrench-text-primary"
                            isCTA={true}
                        />
                    </ul>
                </div>

            </div>
        </section>
    );
}

export default WhyChooseUs;
