import { BASE_URL } from "../../utils/constant-value/constant";

export const LESSON_TYPES_API = `${BASE_URL}/lesson-types`;
export const LESSON_TYPE_BY_ID_API = (id: string) => `${BASE_URL}/lesson-types/${id}`;
