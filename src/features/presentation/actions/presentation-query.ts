import { createServerFn } from "@tanstack/react-start";
import { presentationIdInputSchema } from "../types/schema";
import { authMiddleware } from "#/middleware/auth";

export const getPresentationWithSlides = createServerFn({method:"GET"})
.validator((data:unknown)=>presentationIdInputSchema.parse(data))
.middleware([authMiddleware])
.handler(async({data, context})=>{
    const userId = context?.session?.user
})