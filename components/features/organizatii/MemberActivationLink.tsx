import { CopyableLink } from "@/components/ui/CopyableLink";

export function MemberActivationLink({ href, nume }: { href: string; nume: string }) {
  return (
    <CopyableLink
      href={href}
      inputLabel={`Link de activare pentru ${nume}`}
      copyLabel={`Copiază linkul de activare pentru ${nume}`}
    />
  );
}
