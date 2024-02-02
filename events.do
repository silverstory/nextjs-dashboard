do


Event

    id,
    title,
    start_on,
    start_at,
    pax = 0,
    purpose,
    venue: CEREMONIAL HALL | HEROES HALL | PRESIDENT'S HALL | OTHERS,
    holdingroom,
    eventsetup = THEATER STYLE | CONFERENCE MEETING STYLE | CLASSROOM STYLE | BANQUET STYLE | OTHERS,
    menurequest : IN-HOUSE | CATERED,
    typeofservice = PACKED | PLATED | BUFFET | PASS AROUND
    servingschedule = BREAKFAST | AM SNACK | LUNCH | PM SNACK | DINNER | MID-NIGHT SNACK,
    time of serving: 01:30 PM,
    foodrestriction: No | Yes,
    foodinstruction,
    typeofdrinks: Bottled Water | Coffee / Tea | Others,
    audiovisualreqs: PROJECTOR | SOUND SYSTEM | MONITOR/LCD | LAPTOP | MICROPHONE | PODIUM | STAGE,
    tokengifts: No | Yes,
    remarks: long text,
    attire: nullable,
    entrancegate: nullable,
    updatedby = userid
    timestamp


Recipe

  id
  title,
  pax,
  serving,
  instruction,
  cookingtime,
  eventId,
  updatedby,
  timestamp


Ingredient

  id,
  title,
  unit,
  price,
  amount,
  recipeid,
  ingredientsqlid,
  updatedby,
  timestamp

