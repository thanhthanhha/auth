const { default: mongoose } = require("mongoose")

const {MONGO_URI} = process.env;

exports.connect = async () => {
    mongoose
        .connect(MONGO_URI, {
        })
        .then(async () => {
            console.log("Connected to DB")
            await mongoose.connection.db.collection('stories').createIndex({ name: 'text', summary: 'text' });
            await mongoose.connection.db.collection('chapters').createIndex({ content: 'text', title: 'text' });
        })
        .catch((error) => {
            console.log(`database connection fail, please check service and config file ${MONGO_URI}`);
            console.error(error);
            process.exit(1);
        })
}