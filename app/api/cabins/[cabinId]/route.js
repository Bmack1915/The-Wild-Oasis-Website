import { getBookedDatesByCabinId, getCabin } from "@/app/_lib/data-service";

export async function GET(request, { params }) {
  // What this does: it gets the cabinId from the URL, then it gets the cabin and booked dates from the database
  const { cabinId } = params;

  try {
    //Promise.all: it allows us to run multiple promises at the same time
    const [cabin, bookedDates] = await Promise.all([
      getCabin(cabinId),
      getBookedDatesByCabinId(cabinId),
    ]);
    //If the cabin is found, it will return the cabin and booked dates
    return Response.json({ cabin, bookedDates });
  } catch {
    //If the cabin is not found, it will return a message
    return Response.json({ message: "Cabin not found" });
  }
}

// export async function POST() {}
