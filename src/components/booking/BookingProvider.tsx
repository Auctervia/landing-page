'use client';
// Ported from sciaxo-landing: holds the booking dialog's open state so any button can open it.
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

// Loaded on first open: keeps the dialog and the phone-number library out of the page's first load.
const BookingDialog = dynamic(() => import('./BookingDialog'), { ssr: false });

type Booking = { open: (email?: string) => void };
const Ctx = createContext<Booking>({ open: () => {} });
export const useBooking = () => useContext(Ctx);

export default function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ email: string; n: number } | null>(null);
  const open = useCallback((email = '') => setState((s) => ({ email, n: (s?.n ?? 0) + 1 })), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {/* A fresh key per opening resets the form and the picked slot. */}
      {state && <BookingDialog key={state.n} initialEmail={state.email} onClose={() => setState(null)} />}
    </Ctx.Provider>
  );
}
