const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },

    // Common fields for all roles
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
      required: true,
    },

    // Fields specific to vendors
    firmName: {
      type: String,
      required: function () {
        return this.role === "vendor";
      },
    },

    // Fields required for users & vendors
    address: {
      type: String,
      required: function () {
        return this.role === "user" || this.role === "vendor";
      },
    },

    username: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return this.email;
      }, // Automatically set username as email
    },

    // Password with validation
    password: {
      type: String,
      required: true,
      minlength: 8,

      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
            value
          );
        },
        message:
          "Password must be 8-12 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.",
      },
    },

    role: {
      type: String,
      required: true,
      enum: ["admin", "vendor", "user"],
      default: "user",
    },
  },
  { timestamps: true } // Enables createdAt and updatedAt timestamps
);

// Add password changed timestamp
userSchema.add({
  passwordChangedAt: Date,
});

// Password hashing middleware (you already have this)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // Only update passwordChangedAt if it's not a new user
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // Subtract 1s to ensure token was created after
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
