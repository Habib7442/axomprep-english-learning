import { analyzeResume, getResumeSummary } from "@/lib/actions/resume.actions";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jobDescription = formData.get("jobDescription") as string | null;
    const action = formData.get("action") as string | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!jobDescription && action === "analyze") {
      return new Response(JSON.stringify({ error: "Job description is required for analysis" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    let result;
    if (action === "analyze") {
      result = await analyzeResume(arrayBuffer, jobDescription!);
    } else if (action === "summarize") {
      result = await getResumeSummary(arrayBuffer);
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    return new Response(JSON.stringify({ error: "Failed to process resume" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}