import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

// with vercel
// import { sql } from '@vercel/postgres';

const postgres = require('postgres');

// const sql = postgres(process.env.POSTGRES_URL, {
//   host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
//   port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
//   database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
//   username             : process.env.POSTGRES_USER,            // Username of database user
//   password             : process.env.POSTGRES_PASSWORD,            // Password of database user
// });

import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<User | undefined> {

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    
    // console.log(...user);

    // vercel only
    // return user.rows[0];

    // if local
    const the_row = [...user];

    await sql.end();

    return the_row[0];

  } catch (error) {
    await sql.end();
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});
