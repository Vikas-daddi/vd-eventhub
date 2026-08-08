const mongoose = require('mongoose');
const uri = 'mongodb://vikki74111_db_user:basavaraj@ac-8i3yyyi-shard-00-00.pg0bjeg.mongodb.net:27017,ac-8i3yyyi-shard-00-01.pg0bjeg.mongodb.net:27017,ac-8i3yyyi-shard-00-02.pg0bjeg.mongodb.net:27017/?ssl=true&replicaSet=atlas-dgu2h6-shard-0&authSource=admin&appName=Cluster0';

async function test() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connection successful!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}
test();