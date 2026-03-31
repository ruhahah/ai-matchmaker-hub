declare global {
  var Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

export {};
