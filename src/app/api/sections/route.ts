import { NextRequest, NextResponse } from "next/server";
import DBController from "../dbHandler";
import { SectionInterface } from "../../lib/interfaces";


export async function POST(request: NextRequest) {
    const section: SectionInterface | null = await request.json()

    if (!section) return NextResponse.json({status: 'failed update'}, {status: 500});
        
    DBController.createSection(section);
    return NextResponse.json(section, {status: 200});
}

export async function GET() {
    const sections = DBController.getSections();
    return NextResponse.json(sections, {status: 200});
}