import { z } from "zod";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Strict schema — rejects unknown fields
const cvSchema = z.object({
  name: z.string().min(2, "Name required").max(100, "Name too long"),
  profession: z.string().max(100, "Profession too long"),
  experience: z.string().max(5000, "Experience too long"),
  skills: z.array(z.string()).optional(),
}).strict();

// PII guard — reject PII in input
const PII_REGEX = [
  /\b[\w.-]+@[\w.-]+\.\w+\b/i,  // email
  /\b\d{8,}[A-Z]?\b/,              // possible DNI/document
  /\b(?:\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone
];

export function validateCVPayload(body: unknown):
  | { success: true; data: z.infer<typeof cvSchema> }
  | { success: false; error: { message: string }; status: number; issues?: { field: string; message: string }[] } {
  // PII pre-check
  const bodyStr = JSON.stringify(body || {});
  for (const regex of PII_REGEX) {
    if (regex.test(bodyStr)) {
      return {
        success: false,
        error: { message: "PII detected in payload" },
        status: 400,
      };
    }
  }

  // Zod validation
  const result = cvSchema.safeParse(body);
  if (!result.success) {
    return {
      success: false,
      error: { message: "Invalid payload" },
      status: 400,
      issues: result.error.issues.map(e => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }

  return { success: true, data: result.data };
}

// Apply to route handler
export function withCVValidation(handler: (req: NextRequest) => Response | Promise<Response>) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json().catch(() => null);
      if (!body) {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
      }

      const validation = validateCVPayload(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.message },
          { status: validation.status }
        );
      }

      // Add validated data to request
      (req as any).validatedBody = validation.data;
      return handler(req);
    } catch (err) {
      console.error("[cv-endpoint] Validation error:", err);
      return NextResponse.json(
        { error: "Internal error" },
        { status: 500 }
      );
    }
  };
}
