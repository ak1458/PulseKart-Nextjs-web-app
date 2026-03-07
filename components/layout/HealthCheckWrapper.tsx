'use client';

import React, { useState, useEffect } from 'react';
import { useHealthCheck } from '@/lib/health-check';
import HealthCheckModal from '@/components/ui/HealthCheckModal';

export default function HealthCheckWrapper() {
    const { showCheckIn, pendingCheckIn, dismissCheckIn } = useHealthCheck();

    const [daysSince, setDaysSince] = useState(7);

    useEffect(() => {
        if (pendingCheckIn) {
            setDaysSince(Math.floor((Date.now() - new Date(pendingCheckIn.date).getTime()) / (1000 * 60 * 60 * 24)));
        }
    }, [pendingCheckIn]);

    return (
        <HealthCheckModal
            isOpen={showCheckIn}
            onClose={dismissCheckIn}
            diseaseName={pendingCheckIn?.diseaseName || 'your condition'}
            medicineName={pendingCheckIn?.medicineName || 'prescribed medicine'}
            daysSincePurchase={daysSince}
        />
    );
}
