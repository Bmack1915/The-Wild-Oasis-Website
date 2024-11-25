"use client";
import { deleteReservation } from "../_lib/actions";
import ReservationCard from "./ReservationCard";
import { useOptimistic } from "react";

function ReservationList({ bookings }) {
  //Optimistc state is what we expect the state to be after the mutation is successful
  //Its whats returned at the beginning and whats called when no async action is currently running
  const [optimsiticBookings, optimsiticDelete] = useOptimistic(
    bookings,
    (currentBookings, bookingId) => {
      return currentBookings.filter((booking) => booking.id !== bookingId);
    }
  );

  async function handleDelete(bookingId) {
    optimsiticDelete(bookingId);
    deleteReservation(bookingId);
  }

  return (
    <ul className="space-y-6">
      {optimsiticBookings.map((booking) => (
        <ReservationCard
          onDelete={handleDelete}
          booking={booking}
          key={booking.id}
        />
      ))}
    </ul>
  );
}

export default ReservationList;
