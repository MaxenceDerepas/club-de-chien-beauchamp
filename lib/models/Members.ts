import mongoose, { Schema, models, model } from "mongoose";

const MemberSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        phoneCompany: {
            type: String,
            trim: true,
            default: "",
        },
        policyNumber: {
            type: String,
            trim: true,
            default: "",
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        owner1Name: {
            type: String,
            trim: true,
            default: "",
        },
        owner1BirthDate: {
            type: Date,
            default: null,
        },

        owner2Name: {
            type: String,
            trim: true,
            default: "",
        },
        owner2BirthDate: {
            type: Date,
            default: null,
        },
        dogPhotoUrl: {
            type: String,
            trim: true,
            default: "",
        },

        dogName: {
            type: String,
            required: true,
            trim: true,
        },
        dogBreed: {
            type: String,
            trim: true,
            default: "",
        },
        dogSex: {
            type: String,
            enum: ["male", "female", "unknown"],
            default: "unknown",
        },
        dogBirthDate: {
            type: Date,
            default: null,
        },
        dogLofNumber: {
            type: String,
            trim: true,
            default: "",
        },
        dogIdentificationNumber: {
            type: String,
            trim: true,
            default: "",
        },
        rabiesBoosterDate: {
            type: Date,
            default: null,
        },

        registrationDate: {
            type: Date,
            default: Date.now,
        },
        membershipActive: {
            type: Boolean,
            default: true,
        },
        siteAccessEnabled: {
            type: Boolean,
            default: true,
        },

        username: {
            type: String,
            required: true,
            trim: true,
        },
        usernameLower: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        passwordSalt: {
            type: String,
            required: true,
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

export const Member = models.Member || model("Member", MemberSchema);
