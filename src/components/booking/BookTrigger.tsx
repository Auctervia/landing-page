'use client';
import { useBooking } from './BookingProvider';

/** A button that opens the booking dialog. */
export default function BookTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useBooking();
  return (
    <button type="button" onClick={() => open()} className={className}>
      {children}
    </button>
  );
}
