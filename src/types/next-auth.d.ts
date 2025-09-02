import { DefaultSession } from 'next-auth';


//user.id exists in DB, but it’s not included in the session payload by default. By default, NextAuth gives you session.user = { name, email, image }.

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string;
    };
  }

  interface User {
    id: string;
    email: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
