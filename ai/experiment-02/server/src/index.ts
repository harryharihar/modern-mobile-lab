import express from "express";
import OpenAI from "openai";
import "dotenv/config";
import { z } from "zod";

const orderZodSchema = z.object({
    intent: z.enum(["create_order", "modify_order", "cancel_order", "unknown"]),

    items: z.array(
        z.object({
            name: z.string(),

            quantity: z.number().int(),

            size: z.enum(["small", "medium", "large", "unknown"]),

            customizations: z.array(z.string()),
        })
    ),
});
type FoodOrder = z.infer<typeof orderZodSchema>;

const app = express();

const PORT = 3000;

app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
    });
});
const orderSchema = {
    type: "object",
    properties: {
        intent: {
            type: "string",
            enum: ["create_order", "modify_order", "cancel_order", "unknown"],
        },

        items: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                    },

                    quantity: {
                        type: "integer",
                    },

                    size: {
                        type: "string",
                        enum: ["small", "medium", "large", "unknown"],
                    },

                    customizations: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                },

                required: ["name", "quantity", "size", "customizations"],

                additionalProperties: false,
            },
        },
    },

    required: ["intent", "items"],

    additionalProperties: false,
};

app.post("/api/order", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({
                error: "Prompt is required",
            });
        }

        const response = await openai.responses.create({
            model: "gpt-5.6",

            input: `
  You are a food ordering assistant.
  
  Extract the customer's order request into the provided structured format.
  
  Customer request:
  ${prompt.trim()}
  `,

            text: {
                format: {
                    type: "json_schema",
                    name: "food_order",
                    schema: orderSchema,
                    strict: true,
                },
            },
        });

        const result = JSON.parse(response.output_text);

        const validatedResult: FoodOrder = orderZodSchema.parse(result);

        const requiresClarification =
            validatedResult.items.some(
                (item) =>
                    item.name.toLowerCase().includes("pizza") &&
                    item.size === "unknown"
            );

        let nextAction: "place_order" | "ask_clarification" | "unsupported_request";

        if (validatedResult.intent === "unknown") {
            nextAction = "unsupported_request";
        } else if (
            validatedResult.intent === "create_order" &&
            validatedResult.items.length > 0 &&
            !requiresClarification
        ) {
            nextAction = "place_order";
        } else {
            nextAction = "ask_clarification";
        }

        return res.status(200).json({
            result: validatedResult,
            nextAction,
        });
    } catch (error) {
        console.error("Request failed:", error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Experiment 02 server running on http://localhost:${PORT}`);
});
