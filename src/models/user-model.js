import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    // auth provider
    provider: {
        type: String,
        enum: ["manual", "google", "github"],
        required: true
    },

    // manual auth
    passwordHash: {
        type: String,
        required:  function () {
            return this.provider === "manual";
        }
    },

    // oauth ids
    googleId: { type: String, sparse: true },
    githubId: { type: String, sparse: true },

    // roles & permissions
    role: {
        type: String,
        enum: ["student", "examiner", "admin"],
        default: "student",
    },

    // permissions
    // examinerStatus: {
    //     type: String,
    //     enum: ["pending", "approved", "rejected"],
    //     default: "pending",
    // },
}, { timestamps: true } )

export default mongoose.models.User || mongoose.model("User", userSchema)