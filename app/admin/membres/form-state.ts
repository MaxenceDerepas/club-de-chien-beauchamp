export type CreateMemberFormState = {
    error: string | null;
    values: {
        firstName: string;
        lastName: string;
        address: string;
        phone: string;
        phoneCompany: string;
        policyNumber: string;
        email: string;

        owner1Name: string;
        owner1BirthDate: string;
        owner1Email: string;

        owner2Name: string;
        owner2BirthDate: string;
        owner2Email: string;

        dogName: string;
        dogBreed: string;
        dogSex: "male" | "female" | "unknown";
        dogBirthDate: string;
        dogLofNumber: string;
        dogIdentificationNumber: string;
        rabiesBoosterDate: string;
        dogPhotoUrl: string;

        level:
            | "chiot"
            | "premier_cours"
            | "ruban_violet"
            | "ruban_bleu"
            | "ruban_blanc"
            | "ruban_rouge"
            | "ruban_noir";

        healthCourse: boolean;
        obedience: boolean;
        username: string;
        registrationDate: string;
        membershipActive: boolean;
        siteAccessEnabled: boolean;
        notes: string;
    };
};

export const initialCreateMemberState: CreateMemberFormState = {
    error: null,
    values: {
        firstName: "",
        lastName: "",
        address: "",
        phone: "",
        phoneCompany: "",
        policyNumber: "",
        email: "",

        owner1Name: "",
        owner1BirthDate: "",

        owner2Name: "",
        owner2BirthDate: "",

        dogName: "",
        dogBreed: "",
        dogSex: "unknown",
        dogBirthDate: "",
        dogLofNumber: "",
        dogIdentificationNumber: "",
        rabiesBoosterDate: "",
        dogPhotoUrl: "",

        level: "chiot",
        healthCourse: false,
        obedience: false,

        username: "",
        registrationDate: "",
        membershipActive: true,
        siteAccessEnabled: true,
        notes: "",
    },
};
