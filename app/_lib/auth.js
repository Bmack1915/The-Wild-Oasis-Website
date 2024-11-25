import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createGuest, getGuest } from "./data-service";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  //Authorize the user if they have an account
  //If the user is authorized, they can access the site
  //returns true if the user is authorized
  //returns false if the user is not authorized
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    // sign in callback,
    //This isn't the sign in method, this is the callback method that runs before that process.
    //Its like middleware for the sign in process

    //We only need the user one, but this method also receieves account and profile
    async signIn({ user, account, profile }) {
      try {
        //Check if the person is a guest
        const existingGuest = await getGuest(user.email);

        //If the person is not a guest, create a guest
        if (!existingGuest)
          await createGuest({ email: user.email, fullName: user.name });

        return true;
      } catch {
        return false;
      }
    },

    //Whats happeninog here? We need the guest id to be stored in the session, so we can access it later
    //This is a callback that runs after the session is created
    // We're adding the guest id to the session
    //This is so we can access the guest id later
    async session({ session }) {
      const guest = await getGuest(session.user.email);
      //Mutate the session to add the guest id
      session.user.guestId = guest.id;
      return session;
    },
  },
  // SignIn routes is /login
  pages: {
    signIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
