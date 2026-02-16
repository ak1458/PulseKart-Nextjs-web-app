'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Phone, Calendar, Stethoscope } from '@/lib/icons';

// Doctors are loaded from the backend. Keep empty for a clean client-ready view.
const DOCTORS: any[] = [];

export default function DoctorsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Doctors Near You</h1>
                <p className="text-gray-500">Book appointments with top specialists in your area.</p>
            </div>

            {DOCTORS.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                        <Stethoscope className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No doctors available yet</h2>
                    <p className="text-sm text-gray-500 mb-6">Check back soon or start a consultation for quick guidance.</p>
                    <Link href="/consult" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors">
                        Start Consultation
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DOCTORS.map((doctor) => (
                        <div key={doctor.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col">
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src={doctor.image}
                                    alt={doctor.name}
                                    className="w-20 h-20 rounded-xl object-cover"
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                                    <p className="text-[#14b8a6] font-medium text-sm">{doctor.specialty}</p>
                                    <p className="text-gray-500 text-xs mt-1">{doctor.experience} experience</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{doctor.location} ({doctor.distance})</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="font-bold text-gray-900">{doctor.rating}</span>
                                    <span className="text-gray-400">({doctor.reviews} reviews)</span>
                                </div>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                                    <Phone className="w-4 h-4" /> Call
                                </button>
                                <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#14b8a6] text-white font-bold hover:bg-[#0f766e] transition-colors shadow-lg shadow-teal-500/20">
                                    <Calendar className="w-4 h-4" /> Book
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


