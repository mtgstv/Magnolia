// A flor do ícone do site (mesmo desenho do public/favicon.svg) com um cabinho e uma folha,
// para parecer que está brotando da letra embaixo dela (o "o" de Magnolia). Feita em SVG dentro do React para
// as pétalas poderem se mexer: quando o mouse passa sobre um elemento pai com a classe
// "group/titulo", as duas pétalas laterais balançam (a do meio fica parada).
const PETALA = "origin-[32px_36px] [transform-box:view-box]";

export default function FlorMagnolia({ className = "" }) {
  return (
    <svg viewBox="0 0 64 80" aria-hidden="true" className={className}>
      {/* Cabinho e folha (o fim do cabinho encosta na letra) */}
      <path d="M32 40 C 32 55, 30 68, 32 80" fill="none" stroke="#166534" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="40" cy="60" rx="8" ry="3.5" fill="#4ade80" stroke="#166534" strokeWidth="2" transform="rotate(-35 40 60)" />

      <g fill="#f9a8d4" stroke="#be185d" strokeWidth="2">
        <g className={`${PETALA} group-hover/titulo:animate-petala-esquerda`}>
          <ellipse cx="32" cy="20" rx="9" ry="16" transform="rotate(-55 32 36)" />
        </g>
        <g className={`${PETALA} group-hover/titulo:animate-petala-direita`}>
          <ellipse cx="32" cy="20" rx="9" ry="16" transform="rotate(55 32 36)" />
        </g>
        <ellipse cx="32" cy="20" rx="9" ry="16" />
      </g>
      <circle cx="32" cy="36" r="5" fill="#166534" />
    </svg>
  );
}
