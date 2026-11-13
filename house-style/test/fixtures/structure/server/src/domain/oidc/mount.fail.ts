// A domain module that mounts a provider: rule 6 reads its routes as it reads a feature's.
interface Instance {
  route(options: { method: string; url: string; handler: () => void }): void;
}

export function mountProvider(app: Instance): void {
  app.route({ method: "GET", url: "/oidc/*", handler: () => {} });
}
