declare module 'module-alias' {
  export function addAliases(aliases: Record<string, string>): void;
  export function addPath(path: string): void;
  export default {
    addAliases,
    addPath
  };
} 