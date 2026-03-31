declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export interface Request {
    method: string;
    url: string;
    headers: Headers;
    json(): Promise<any>;
    text(): Promise<string>;
  }
  
  export function serve(handler: (req: Request) => Promise<Response>): void;
  
  export interface ResponseInit {
    status?: number;
    headers?: Record<string, string>;
  }
  
  export class Response {
    constructor(body?: string | null, init?: ResponseInit);
  }
}
