import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(3).max(255),
  lastName: z.string().min(3).max(255),
  username: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(6).max(255),
});

const postSchema = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(3),
  image: z.string()
});

export { userSchema, postSchema };

