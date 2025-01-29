import { NextResponse } from "next/server";
import DBController from "./dbHandler";
import { ApiResponseInterface, DBReseponseInterface, SectionInterface } from "../lib/interfaces";

export async function GET() {
  const db : DBReseponseInterface | undefined = DBController.getDB();
  
  // map of sections by id
  const sectionsMap: { [key: string]: SectionInterface } = {};
  db?.sections.map(section => {
    sectionsMap[section.id] = section;
  });

  // order items by section order, then by id
  const items = db?.products.sort((a, b) => {
    const sectionA = sectionsMap[a.section];
    const sectionB = sectionsMap[b.section];
    return (sectionA?.order || 0) - (sectionB?.order || 0) || a.id.localeCompare(b.id);
  });

  if (!items) {
    return NextResponse.json({ error: 'No items found' }, { status: 404 });
  }

  
  const body : ApiResponseInterface = {
    items,
    sections: sectionsMap
  }

  return NextResponse.json(
    body,
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    }
  );
}
