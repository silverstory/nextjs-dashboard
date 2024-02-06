// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};


// prod

// ventsE
// id,
// name,
// start_on: "2023-08-30 09:00",
// start_at: "2023-08-30 10:00",
// pax = 0,
// purpose,
// venue: CEREMONIAL HALL | HEROES HALL | PRESIDENT'S HALL | HOLDING ROOM | OTHERS,
// holdingroom,
// eventsetup = THEATER STYLE | CONFERENCE MEETING STYLE | CLASSROOM STYLE | BANQUET STYLE | OTHERS,
// menurequest : IN-HOUSE | CATERED,
// typeofservice = PACKED | PLATED | BUFFET | PASS AROUND
// servingschedule = BREAKFAST | AM SNACK | LUNCH | PM SNACK | DINNER | MID-NIGHT SNACK,
// timeofserving: 01:30:07,
// foodrestriction: No | Yes,
// foodinstruction,
// remarks: long text,
// user_id = userid,
// created_at,
// updated_at


// removed
// typeofdrinks: Bottled Water | Coffee / Tea | Others,
// audiovisualreqs: PROJECTOR | SOUND SYSTEM | MONITOR/LCD | LAPTOP | MICROPHONE | PODIUM | STAGE,
// tokengifts: No | Yes,
// attire: nullable,
// entrancegate: nullable,

export type VenstE = {
  id: string;
  name: string;
  start_on: string;
  start_at: string;
  pax: number;
  purpose: string;
  // In TypeScript, this is called a string union type.
  // It means that the "venue" property can only be one of the five strings below.
  venue: 'CEREMONIAL HALL' | 'HEROES HALL' | 'PRESIDENT`S HALL' | 'HOLDING ROOM' | 'OTHERS';
  holdingroom: string;
  eventsetup: 'THEATER STYLE' | 'CONFERENCE MEETING STYLE' | 'CLASSROOM STYLE' | 'BANQUET STYLE' | 'OTHERS';
  menurequest: 'IN-HOUSE' | 'CATERED';
  typeofservice: 'PACKED' | 'PLATED' | 'BUFFET' | 'PASS AROUND';
  servingschedule: 'BREAKFAST' | 'AM SNACK' | 'LUNCH' | 'PM SNACK' | 'DINNER' | 'MID-NIGHT SNACK';
  timeofserving: string;
  foodrestriction: 'No' | 'Yes';
  foodinstruction: string;
  remarks: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type LatestVenstE = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestVenstERaw = Omit<LatestVenstE, 'amount'> & {
  amount: number;
};

export type VenstETable = {  
  id: string;
  name: string;
  purpose: string;
  image_url: string;
  date: string; // start_on + start_at
  pax: number;
  venue: 'CEREMONIAL HALL' | 'HEROES HALL' | 'PRESIDENT`S HALL' | 'HOLDING ROOM' | 'OTHERS';
  eventsetup: 'THEATER STYLE' | 'CONFERENCE MEETING STYLE' | 'CLASSROOM STYLE' | 'BANQUET STYLE' | 'OTHERS';
};

export type VenstEForm = {
  id: string;
  name: string;
  start_on: string;
  start_at: string;
  pax: number;
  purpose: string;
  venue: 'CEREMONIAL HALL' | 'HEROES HALL' | 'PRESIDENT`S HALL' | 'HOLDING ROOM' | 'OTHERS';
  holdingroom: string;
  eventsetup: 'THEATER STYLE' | 'CONFERENCE MEETING STYLE' | 'CLASSROOM STYLE' | 'BANQUET STYLE' | 'OTHERS';
  menurequest: 'IN-HOUSE' | 'CATERED';
  typeofservice: 'PACKED' | 'PLATED' | 'BUFFET' | 'PASS AROUND';
  servingschedule: 'BREAKFAST' | 'AM SNACK' | 'LUNCH' | 'PM SNACK' | 'DINNER' | 'MID-NIGHT SNACK';
  timeofserving: string;
  foodrestriction: 'No' | 'Yes';
  foodinstruction: string;
  remarks: string;
  user_id: string;
};