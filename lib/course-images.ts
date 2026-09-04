import clientPromise from "@/lib/mongodb";
import type { CourseImage } from "@/lib/course-constants";

export type { CourseImage } from "@/lib/course-constants";
export { COURSE_IDS, COURSE_LABELS } from "@/lib/course-constants";
export type { CourseId } from "@/lib/course-constants";

export type CourseImagesDoc = {
    courseId: string;
    images: CourseImage[];
    updatedAt: Date;
};

function getDb() {
    return clientPromise.then((client) => client.db("club-canin"));
}

/**
 * Get images for a single course. Returns null if none configured.
 */
export async function getCourseImages(
    courseId: string,
): Promise<CourseImagesDoc | null> {
    const db = await getDb();
    return db
        .collection<CourseImagesDoc>("courseImages")
        .findOne({ courseId });
}

/**
 * Get images for all courses at once. Returns a map courseId -> images.
 */
export async function getAllCourseImages(): Promise<
    Record<string, CourseImage[]>
> {
    const db = await getDb();
    const docs = await db
        .collection<CourseImagesDoc>("courseImages")
        .find({})
        .toArray();
    const map: Record<string, CourseImage[]> = {};
    for (const doc of docs) {
        map[doc.courseId] = doc.images;
    }
    return map;
}

/**
 * Update images for a course (upsert).
 */
export async function updateCourseImages(
    courseId: string,
    images: CourseImage[],
): Promise<void> {
    const db = await getDb();
    await db.collection<CourseImagesDoc>("courseImages").updateOne(
        { courseId },
        {
            $set: {
                images,
                updatedAt: new Date(),
            },
        },
        { upsert: true },
    );
}
