import UpdateReservationForm from "@/app/_components/UpdateReservationForm";
import { getBooking, getCabin, getSettings } from "@/app/_lib/data-service";

export default async function Page({ params }) {
  const booking = await getBooking(params.reservationId);
  const cabin = await getCabin(booking.cabinId);
  const maxCapacity = cabin.maxCapacity;

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Edit Reservation #{booking.id}
      </h2>

      <UpdateReservationForm maxCapacity={maxCapacity} booking={booking} />
    </div>
  );
}
