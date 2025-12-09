import {MongoClient} from 'mongodb';

let mongoConfig = {
    serverUrl: process.env.MONGO_SERVER_URL || 'mongodb://localhost:27017',
    database: process.env.MONGO_DATABASE || '404GroupCluster'
}

let _connection = undefined;
let _db = undefined;

const dbConnection = async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl);
    _db = _connection.db(mongoConfig.database);
  }

  return _db;
};
const closeConnection = async () => {
  await _connection.close();
};

export { dbConnection, closeConnection };