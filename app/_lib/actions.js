"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) throw new Error("Booking could not be created");

  revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect("/cabins/thankyou");
}

export async function updateProfile(formData) {
  const session = await auth();

  //Common to throw errors, not try catches in server actions
  if (!session) {
    throw new Error("You must be signed in to update your profile");
  }

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  // Define the regex pattern
  const nationalIdPattern = /^[a-zA-Z0-9]{6,12}$/;

  if (!nationalIdPattern.test(nationalID)) {
    throw new Error("Please provide a valid national ID");
  }

  const updateData = {
    nationality,
    countryFlag,
    nationalID,
  };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");

  return data;
}

export async function updateReservation(formData) {
  const session = await auth();

  //Common to throw errors, not try catches in server actions
  if (!session) {
    throw new Error("You must be signed in to update your profile");
  }

  // Get the booking data for this user
  const bookings = await getBookings(session.user.guestId);
  // Get the ids of the bookings
  const guestBookingIds = bookings.map((booking) => booking.id);

  const bookingId = formData.get("bookingId");

  //   // If the booking id does not belong to the guest  throw an error
  if (guestBookingIds.includes(bookingId)) {
    throw new Error("You are not authorized to edit this booking");
  }

  const updatedFields = {
    numGuests: formData.get("numGuests"),
    observations: formData.get("observations").slice(0, 1000),
  };

  // Update the booking in the database
  const { data, error } = await supabase
    .from("bookings")
    .update(updatedFields)
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }
  console.log("Booking updated");

  // Revalidate the path so the UI is updated
  revalidatePath("/account/reservations/");
  revalidatePath("/account/reservations/edit/" + bookingId);
  // Redirect the user to the reservations page
  redirect("/account/reservations");
}

export async function deleteReservation(bookingId) {
  const session = await auth();

  //Common to throw errors, not try catches in server actions
  if (!session) {
    throw new Error("You must be signed in to update your profile");
  }

  const bookings = await getBookings(session.user.guestId);
  const guestBookingIds = bookings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId)) {
    throw new Error("You are not authorized to delete this booking");
  }

  const { data, error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
