const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: { type: String, default: null },
    provider: { type: String, enum: ['local', 'kakao'], default: 'local' },
    kakaoId: { type: String, unique: true, sparse: true },
    profileImage: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

module.exports = mongoose.model("User", UserSchema);
