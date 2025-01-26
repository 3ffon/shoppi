import { NextResponse } from "next/server";
import { groupBy, orderBy } from "lodash";
import DBController from "./dbHandler";
import { ApiResponseInterface, DBReseponseInterface } from "../lib/interfaces";

export async function GET() {
  const db : DBReseponseInterface | undefined = DBController.getDB();
  
  // order sections list by order
  const sections = orderBy(db?.sections, sec => sec.order);

  // group by sections
  const itemsGrouped = groupBy(db?.products, product => product.section);

  // order items by id
  Object.keys(itemsGrouped).forEach(section => {
    itemsGrouped[section] = orderBy(itemsGrouped[section], item => item.id);
  });

  const body : ApiResponseInterface = {
    sections,
    itemsGrouped
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
