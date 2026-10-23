// Mensagem para listas vazias (sem favoritos, nenhum resultado no filtro...)
export default function EstadoVazio({ icone: Icone, titulo, texto, children }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-14 text-center">
      {Icone && (
        <span className="flex size-14 items-center justify-center rounded-full bg-white text-marca shadow-sm">
          <Icone className="size-6" strokeWidth={1.5} />
        </span>
      )}
      <h3 className="font-bodoni text-2xl text-stone-900">{titulo}</h3>
      {texto && <p className="max-w-md text-stone-600">{texto}</p>}
      {children && <div className="mt-3 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
