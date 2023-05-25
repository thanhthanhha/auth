const mongoose = require("mongoose");
const User = require('./user');

const userSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String },
    chapters: {
        chapter: {
            title: {type: String},
            content: {type: String}
        }
    },
    summary: {type: String},
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    chapter: { type: mongoose.Types.ObjectId, ref: "Chapter" },
});

module.exports = mongoose.model("stories", userSchema);