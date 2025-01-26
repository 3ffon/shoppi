import { NextRequest, NextResponse } from "next/server";
import DBController from "../../dbHandler";
import { SectionInterface } from "../../../lib/interfaces";


export async function PATCH(request: NextRequest) {
    const section: SectionInterface | null = await request.json()

    if (!section) return NextResponse.json({status: 'failed update'}, {status: 500});
        
    DBController.updateSection(section);
    return NextResponse.json(section, {status: 200});

}