declare module "@koa/cors" {
    import { Middleware } from "koa";
    interface Options {
      origin?: string | ((ctx: any) => string);
      allowMethods?: string[];
      exposeHeaders?: string[];
      allowHeaders?: string[];
      credentials?: boolean;
      maxAge?: number;
    }
    function cors(options?: Options): Middleware;
    export = cors;
  }
  
  