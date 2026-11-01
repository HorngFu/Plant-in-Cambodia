import { makeRouteHandler } from "@keystatic/next/route-handler";
import { isKeystaticEnabled } from "@/lib/keystatic";
import config from "../../../../../keystatic.config";

const handler = makeRouteHandler({ config });

const notFound = () => new Response("Not found", { status: 404 });

export function GET(request: Request) {
  return isKeystaticEnabled() ? handler.GET(request) : notFound();
}

export function POST(request: Request) {
  return isKeystaticEnabled() ? handler.POST(request) : notFound();
}
