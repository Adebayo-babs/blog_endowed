const dns = require('dns');
const mongoose = require('mongoose');

// Some networks' DNS servers refuse the SRV lookups that mongodb+srv:// links need.
// Use public DNS for those lookups so the connection doesn't depend on the local network.
if (process.env.DNS_SERVERS !== 'system') {
  dns.setServers((process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(',').map((s) => s.trim()));
}

let bucket = null;

async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'media' });
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

function getBucket() {
  if (!bucket) throw new Error('Media storage is not ready yet');
  return bucket;
}

module.exports = { connectDB, getBucket };
