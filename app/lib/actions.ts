'use server';

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

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// auth
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

// Tip: If you're working with forms that have many fields, you may want to consider using the entries() method with JavaScript's Object.fromEntries(). For example:

// const rawFormData = Object.fromEntries(formData.entries())


// This is temporary until @types/react-dom is updated
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  // Validate form using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 
  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });
 
  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    await sql.end();
  } catch (error) {
    await sql.end();
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }
 
  // Revalidate the cache for the invoices page and redirect the user.
  // Next.js has a Client-side Router Cache that stores the route segments in the user's browser for a time. Along with prefetching, this cache ensures that users can quickly navigate between routes while reducing the number of requests made to the server.
  // Since you're updating the data displayed in the invoices route, you want to clear this cache and trigger a new request to the server. You can do this with the revalidatePath function from Next.js
  revalidatePath('/dashboard/invoices');
  // Once the database has been updated, the /dashboard/invoices path will be revalidated, and fresh data will be fetched from the server.
  // At this point, you also want to redirect the user back to the /dashboard/invoices page. You can do this with the redirect function from Next.js
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    await sql.end();
  } catch (error) {
    await sql.end();
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    await sql.end();
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    await sql.end();
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}