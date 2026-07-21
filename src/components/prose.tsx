// Renders a markdown body compiled by Velite.
//
// On dangerouslySetInnerHTML: the HTML here is not user input. It is produced at
// build time from markdown committed to this repository, which reaches main only
// through a pull request. There is no path by which a site visitor can put
// markup through this component. The alternative (parsing the HTML back into a
// React tree at runtime) would add a dependency and a client bundle to defend
// against a threat that does not exist for a static, first-party content site.
export function Prose({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`prose-kothom ${className}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time, first-party markdown — see comment above
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
