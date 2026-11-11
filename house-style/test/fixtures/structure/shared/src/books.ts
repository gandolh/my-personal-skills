import { z } from "zod";

export const BookInput = z.object({ title: z.string() });
export const Book = BookInput.extend({ id: z.string() });
export const BookList = z.array(Book);
export const BookQuery = z.object({ q: z.string() });
