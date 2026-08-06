import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface RevalidateBody {
  paths: string[];
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let body: RevalidateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const paths = body.paths;

  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json(
      { message: "`paths` must be a non-empty array of strings" },
      { status: 400 },
    );
  }

  const results = paths.map((path) => {
    try {
      revalidatePath(path);
      return { path, ok: true };
    } catch (error) {
      console.error(`revalidatePath failed for "${path}":`, error);
      return { path, ok: false };
    }
  });

  const failed = results.filter((r) => !r.ok);

  return NextResponse.json({
    message: failed.length
      ? "Revalidated with some failures"
      : "Revalidated successfully",
    results,
  });
}