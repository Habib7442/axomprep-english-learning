import { cbseChapters } from "@/lib/cbse-chapters";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  
  // Find the chapter by ID
  const chapter = cbseChapters.find(chapter => chapter.chapter_number.toString() === id);
  
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }
  
  return NextResponse.json(chapter);
}