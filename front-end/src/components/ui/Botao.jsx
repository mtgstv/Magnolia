import { Link } from "react-router-dom";

const VARIANTES = {
  primario: "bg-marca text-white hover:bg-destaque",
  secundario: "border border-marca text-marca hover:bg-marca hover:text-white",
  claro: "bg-white text-marca hover:bg-marca-clara"
};

// Com "to" vira um link do React Router; sem "to", um <button>
export default function Botao({ to, variante = "primario", className = "", children, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variante]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
