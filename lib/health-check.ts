'use client';

import { useState, useEffect } from 'react';

interface PurchaseRecord {
    id: string;
    date: string;
    diseaseName: string;
    medicineName: string;
    checkedIn: boolean;
}

const STORAGE_KEY = 'pulsekart_purchases';
const CHECKIN_KEY = 'pulsekart_last_checkin';

// Save purchase record
export function savePurchase(diseaseName: string, medicineName: string): void {
    if (typeof window === 'undefined') return;
    
    const purchases: PurchaseRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    purchases.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        diseaseName,
        medicineName,
        checkedIn: false
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
}

// Check if health check should be shown
export function useHealthCheck() {
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [pendingCheckIn, setPendingCheckIn] = useState<PurchaseRecord | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const checkPendingCheckIns = () => {
            const purchases: PurchaseRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            const lastCheckIn = localStorage.getItem(CHECKIN_KEY);
            
            // Don't show if already checked in today
            if (lastCheckIn) {
                const lastDate = new Date(lastCheckIn);
                const today = new Date();
                if (lastDate.toDateString() === today.toDateString()) {
                    return;
                }
            }
            
            // Find purchases that need check-in (3-14 days old, not checked)
            const now = new Date();
            const pending = purchases.find(p => {
                if (p.checkedIn) return false;
                const purchaseDate = new Date(p.date);
                const daysDiff = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff >= 3 && daysDiff <= 14;
            });
            
            if (pending) {
                setPendingCheckIn(pending);
                setShowCheckIn(true);
            }
        };

        // Check on mount and every hour
        checkPendingCheckIns();
        const interval = setInterval(checkPendingCheckIns, 60 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    const completeCheckIn = (purchaseId: string) => {
        if (typeof window === 'undefined') return;
        
        const purchases: PurchaseRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const updated = purchases.map(p => 
            p.id === purchaseId ? { ...p, checkedIn: true } : p
        );
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        localStorage.setItem(CHECKIN_KEY, new Date().toISOString());
        setShowCheckIn(false);
        setPendingCheckIn(null);
    };

    return {
        showCheckIn,
        pendingCheckIn,
        completeCheckIn,
        dismissCheckIn: () => {
            localStorage.setItem(CHECKIN_KEY, new Date().toISOString());
            setShowCheckIn(false);
        }
    };
}
