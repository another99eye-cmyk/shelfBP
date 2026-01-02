import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema ({
    shelf: defineTable({
        text: v.string(),
        amount: v.number()
    })
})