
import {revalidatePath} from "next/cache";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-revalidate-secret");

    if(secret!== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({message: "Invalid secret"}, {status: 401});
    }

    const {slug} = await req.json();
    revalidatePath(`/joke/${slug}`);
    return NextResponse.json({message: "Revalidated successfully"});
}