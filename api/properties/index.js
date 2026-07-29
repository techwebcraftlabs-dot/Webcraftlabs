import { createJsonRecord, getJsonRecord, listJsonRecords } from "../_lib/jsonTable.js";
import { requireSession } from "../_lib/auth.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      sendJson(res, 200, await listJsonRecords("property_listings"));
      return;
    }

    if (req.method === "POST") {
      await requireSession(req, { roles: ["Administrator", "EVP"] });
      const body = await readJson(req);

      const priceFrom = Math.max(0, Number(body.priceFrom ?? body.priceValue) || 0);
      const priceTo = Math.max(0, Number(body.priceTo ?? priceFrom) || 0);

      if (!body.title || !body.location || !body.type || !priceFrom || !priceTo) {
        sendJson(res, 400, { error: "Title, location, type, Price From, and Price To are required." });
        return;
      }
      if (priceTo < priceFrom) {
        sendJson(res, 400, { error: "Price To must be equal to or higher than Price From." });
        return;
      }

      const payload = {
        title: String(body.title).trim(),
        location: String(body.location).trim(),
        type: String(body.type).trim(),
        priceFrom,
        priceTo,
        priceValue: priceFrom,
        image: String(body.image || "").trim(),
        beds: Math.max(0, Number(body.beds) || 0),
        baths: Math.max(0, Number(body.baths) || 0),
        parking: Math.max(0, Number(body.parking) || 0),
        floorArea: String(body.floorArea || "").trim(),
        status: String(body.status || "New Listing").trim(),
      };
      const id = await createJsonRecord("property_listings", payload);
      sendJson(res, 201, await getJsonRecord("property_listings", id));
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
