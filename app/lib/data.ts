// vercel
// import { sql } from '@vercel/postgres';

const postgres = require('postgres');

// const sql = postgres(process.env.POSTGRES_URL, {
//   host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
//   port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
//   database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
//   username             : process.env.POSTGRES_USER,            // Username of database user
//   password             : process.env.POSTGRES_PASSWORD,            // Password of database user
// });

import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchRevenue() {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    // vercel only
    // return data.rows;
    
    await sql.end();

    // local
    return data;

  } catch (error) {
    await sql.end();
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }

}

export async function fetchLatestInvoices() {
  noStore();

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    // Fetch the last 5 invoices, sorted by date
    const data = await sql<LatestInvoiceRaw>`
        SELECT invoices.amount, customers.name, customers.image_url, customers.email
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        ORDER BY invoices.date DESC
        LIMIT 5`;

    // vercel only
    // const latestInvoices = data.rows.map((invoice) => ({
    //   ...invoice,
    //   amount: formatCurrency(invoice.amount),
    // }));

    // local
    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    await sql.end();
    return latestInvoices;
  } catch (error) {
    await sql.end();
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noStore();

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    // vercel only
    // const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    // const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    // const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    // const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    const the_data = [...data];

    // local
    const numberOfInvoices = Number(the_data[0][0].count ?? '0');
    const numberOfCustomers = Number(the_data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(the_data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(the_data[2][0].pending ?? '0');

    await sql.end();

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    await sql.end();
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  noStore();

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    // vercel only
    // return invoices.rows;
    
    await sql.end();

    // local
    return invoices;

  } catch (error) {
    await sql.end();
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore();

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    // vercel only
    // const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);

    // local
    const totalPages = Math.ceil(Number(count[0].count) / ITEMS_PER_PAGE);

    await sql.end();

    return totalPages;

  } catch (error) {
    await sql.end();
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  noStore();

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    // vercel only
    // const invoice = data.rows.map((invoice) => ({
    //   ...invoice,
    //   // Convert amount from cents to dollars
    //   amount: invoice.amount / 100,
    // }));

    // local
    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    await sql.end();

    return invoice[0];
  } catch (error) {
    await sql.end();
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  noStore();

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    // vercel only
    // const customers = data.rows;
    
    // local
    const customers = data;

    await sql.end();

    return customers;
  } catch (err) {
    await sql.end();
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  noStore();

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    // vercel only
    // const customers = data.rows.map((customer) => ({
    //   ...customer,
    //   total_pending: formatCurrency(customer.total_pending),
    //   total_paid: formatCurrency(customer.total_paid),
    // }));

    // lcoal
    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    await sql.end();

    return customers;
  } catch (err) {
    await sql.end();
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {

  const sql = postgres(process.env.POSTGRES_URL, {
    host                 : process.env.POSTGRES_HOST,            // Postgres ip address[s] or domain name[s]
    port                 : process.env.POSTGRES_PORT,          // Postgres server port[s]
    database             : process.env.POSTGRES_DATABASE,            // Name of database to connect to
    username             : process.env.POSTGRES_USER,            // Username of database user
    password             : process.env.POSTGRES_PASSWORD,            // Password of database user
  });

  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;

    // vercel only
    // return user.rows[0] as User;

    await sql.end();
    // local
    return user as User;

  } catch (error) {
    await sql.end();
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
