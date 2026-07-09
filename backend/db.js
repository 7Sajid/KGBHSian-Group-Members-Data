// Persistent database using MongoDB Atlas's free tier. Unlike a local
// file on Render's disk, this data lives in a completely separate cloud
// service — so restarting, redeploying, or even deleting the Render
// service entirely will NOT lose your members.

const { MongoClient } = require('mongodb');

let client;
let membersCollection;

async function connect() {
  if (membersCollection) return membersCollection;

  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Add it to your .env file (see .env.example).'
    );
  }

  client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  const db = client.db('kgbhsian');
  membersCollection = db.collection('members');

  // Auto-incrementing numeric id, kept simple for the CSV export / filenames
  await membersCollection.createIndex({ id: 1 }, { unique: true });

  return membersCollection;
}

async function nextId() {
  const col = await connect();
  const last = await col.find().sort({ id: -1 }).limit(1).toArray();
  return last.length ? last[0].id + 1 : 1;
}

async function insertMember(member) {
  const col = await connect();
  const id = await nextId();
  const row = { id, ...member };
  await col.insertOne(row);
  return row;
}

async function listMembersPublic() {
  const col = await connect();
  const rows = await col
  
    .find({}, { projection: { _id: 0, name: 1, id: 1, batch: 1, employment: 1, blood: 1, location: 1, phone: 1, submittedAt: 1 } })
    .sort({ submittedAt: -1 })
    .toArray();
  return rows.map((r) => ({ ...r, submitted_at: r.submittedAt }));
}

async function listMembersFull() {
  const col = await connect();
  const rows = await col.find({}, { projection: { _id: 0 } }).sort({ submittedAt: -1 }).toArray();
  return rows;
}

async function countMembers() {
  const col = await connect();
  return col.countDocuments();
}

module.exports = { insertMember, listMembersPublic, listMembersFull, countMembers };
