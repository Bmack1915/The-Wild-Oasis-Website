import { auth } from "../_lib/auth";
import { getBookedDatesByCabinId, getSettings } from "../_lib/data-service";
import DateSelector from "./DateSelector";
import LoginMessage from "./LoginMessage";
import ReservationForm from "./ReservationForm";

async function Reservation({ cabin }) {
  //What this is: it gets the session from the auth function
  const session = await auth();

  //As reservation requires us to get the settings and booked dates, we can use Promise.all to get both at the same time
  //This way we can avoid unnecessary delays
  //We can also use destructuring to get the settings and booked dates
  const [settings, bookedDates] = await Promise.all([
    getSettings(),
    getBookedDatesByCabinId(cabin.id),
  ]);

  return (
    <div className="grid grid-cols-2 border border-primary-800 min-h-[400px]">
      {/* Requires settings, so we can limit bookings to max and min booking length */}
      <DateSelector
        settings={settings}
        bookedDates={bookedDates}
        cabin={cabin}
      />
      {/* If user not logged in, i.e. no session, Login message shown. */}
      {session?.user ? (
        // We're passing the server client boundary here. We're passing the user and cabin to the ReservationForm component which is a client component.
        <ReservationForm user={session.user} cabin={cabin} />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}

export default Reservation;
