import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim:true
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    bio: {
      type: String,
      default: "This is my bio",
    },
    profilePic: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "English",
    },
    learningLanguage: {
      type: String,
      default: "Spanish",
    },
    location: {
      type: String,
      default: "United States",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    friends:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ]
  },
  { timestamps: true }
);



//pre hook
userSchema.pre("save",async function (next) {
  if(!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error); 
  }
})

userSchema.methods.matchPassword = async function (password) {
  const isPasswordMatched =  await bcrypt.compare(password, this.password);
  return isPasswordMatched;
};


const User = mongoose.model("User", userSchema);
export default User;