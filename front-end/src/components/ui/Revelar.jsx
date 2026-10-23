import { useEffect, useRef, useState } from "react";

// Faz o conteúdo subir e aparecer aos poucos quando ele entra na tela durante a rolagem.
// "atraso" (em ms) permite que vários itens apareçam um depois do outro.
export default function Revelar({ as: Tag = "div", atraso = 0, className = "", children, ...props }) {
  const ref = useRef(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true);
          observador.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );

    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${atraso}ms` }}
      className={`transition duration-700 ease-out motion-reduce:transition-none ${
        visivel ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100"
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
