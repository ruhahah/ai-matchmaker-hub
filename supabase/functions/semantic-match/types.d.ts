declare global {
  namespace Deno {
    export function env(): Record<string, string | undefined>;
    export namespace env {
      export function get(key: string): string | undefined;
    }
  }
}

export {};

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export interface SupabaseClient {
    from: (table: string) => any;
    auth: any;
  }
  export function createClient(url: string, key: string): SupabaseClient;
}
