// vercel
// const { db } = require('@vercel/postgres');

const postgres = require('postgres');

const sql = postgres(process.env.POSTGRES_URL, {
  host: process.env.POSTGRES_HOST, // Postgres ip address[s] or domain name[s]
  port: process.env.POSTGRES_PORT, // Postgres server port[s]
  database: process.env.POSTGRES_DATABASE, // Name of database to connect to
  username: process.env.POSTGRES_USER, // Username of database user
  password: process.env.POSTGRES_PASSWORD, // Password of database user
});

const {
  invoices,
  customers,
  revenue,
  users,
  ventse,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

async function seedHeavyUsers() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Create the "users" table if it doesn't exist
    const createTable = await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    console.log(`Created "users" table`);

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

//     use on recipe and ingredients
//     customer_id UUID NOT NULL,

// deal with dates with TO_DATE(), LOCALTIMESTAMP, NOW(), CURRENT_TIMESTAMP

async function seedVentsE() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "events" table if it doesn't exist
    // ts value should be format like '2016-06-22 19:10:25-07'
    const createTable = await sql`
    CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_on DATE NOT NULL,
    start_at TIME NOT NULL,
    pax INT NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    venue VARCHAR(50) NOT NULL,
    holdingroom VARCHAR(50),
    eventsetup VARCHAR(50) NOT NULL,
    menurequest VARCHAR(10) NOT NULL,
    typeofservice VARCHAR(12) NOT NULL,
    servingschedule VARCHAR(16) NOT NULL,
    timeofserving TIME NOT NULL,
    foodrestriction VARCHAR(3) NOT NULL,
    foodinstruction TEXT,
    remarks TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

    console.log(`Created "VentsE" table`);

    // Insert data into the "invoices" table
    const insertedVentsE = await Promise.all(
      ventse.map(
        (ventse) => sql`
        INSERT INTO invoices (
          name,
          start_on,
          start_at,
          pax,
          purpose,
          venue,
          holdingroom,
          eventsetup,
          menurequest,
          typeofservice,
          servingschedule,
          timeofserving,
          foodrestriction,
          foodinstruction,
          remarks,
          user_id,
          updated_at
        )
        VALUES (
          ${ventse.name},
          ${ventse.start_on},
          ${ventse.start_at},
          ${ventse.pax},
          ${ventse.purpose},
          ${ventse.venue},
          ${ventse.holdingroom},
          ${ventse.eventsetup},
          ${ventse.menurequest},
          ${ventse.typeofservice},
          ${ventse.servingschedule},
          ${ventse.timeofserving},
          ${ventse.foodrestriction},
          ${ventse.foodinstruction},
          ${ventse.remarks},
          ${ventse.user_id},
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedVentsE.length} ventsE`);

    return {
      createTable,
      events: insertedVentsE,
    };
  } catch (error) {
    console.error('Error seeding ventsE:', error);
    throw error;
  }
}

async function seedHeavyCustomers() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // Create the "customers" table if it doesn't exist
    const createTable = await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `;

    console.log(`Created "customers" table`);

    // Insert data into the "customers" table
    const insertedCustomers = await Promise.all(
      customers.map(
        (customer) => sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);

    return {
      createTable,
      customers: insertedCustomers,
    };
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedHeavyRevenue() {
  try {
    // Create the "revenue" table if it doesn't exist
    const createTable = await sql`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `;

    console.log(`Created "revenue" table`);

    // Insert data into the "revenue" table
    const insertedRevenue = await Promise.all(
      revenue.map(
        (rev) => sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedRevenue.length} revenue`);

    return {
      createTable,
      revenue: insertedRevenue,
    };
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

async function main() {
  //   vercel only
  //   const client = await db.connect();
  //   await seedUsers(client);
  //   await seedCustomers(client);
  //   await seedInvoices(client);
  //   await seedRevenue(client);
  //   await client.end();

  // local
  // await seedUsers();
  // await seedCustomers();
  // await seedInvoices();
  // await seedRevenue();

  await seedVentsE();

  await sql.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
