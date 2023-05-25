const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    timestamp_day: { type: Date },
    img:
    {
        data: Buffer,
        contentType: String
    },
    work:
    {
        type: [mongoose.Types.ObjectId],
        default: undefined,
        ref: "stories"
    }
});

const storySchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: { type: String },
    chapters: {
        type: [{
            num: String,
            content: mongoose.Types.ObjectId
        }],
        default: undefined
    },
    summary: {type: String},
    user: { type: mongoose.Types.ObjectId, ref: "user" },
});

const chapterSchema = new mongoose.Schema({
    title: {type: String},
    content: {type: String}
});

const Story = mongoose.model("story", storySchema);
const User = mongoose.model("user", userSchema);
const Chapter = mongoose.model("chapter", chapterSchema);


module.exports = {
    Story,
    User,
    Chapter
}
