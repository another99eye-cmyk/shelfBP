import { ConvexError, v } from "convex/values";
import {mutation, query} from "./_generated/server"

export const getShelfs = query({
    handler: async (ctx) => {
        const shelfs = await ctx.db.query("shelf").order("desc").collect();
        return shelfs;
    },
});

export const addShelf = mutation({
    args: {text:v.string()},
    handler: async(ctx,args) => {
        const shelfID = await ctx.db.insert("shelf", {
            text: args.text,
            amount: 0
        });
        return shelfID;
    },
});

export const amountShelf = mutation({
    args:{id:v.id("shelf"), amount: v.number()},
    handler: async(ctx,args) => {
        const shelf = await ctx.db.get(args.id)
        if(!shelf) throw new ConvexError("Shelf not Found")

        await ctx.db.patch(args.id, {
            amount: args.amount,
        })
    }
})