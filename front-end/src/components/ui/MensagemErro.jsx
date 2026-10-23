export default function MensagemErro({ erro, aoTentarDeNovo, className = "" }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center ${className}`}
    >
      <p className="font-medium text-rose-800">
        {erro?.message ?? "Algo deu errado. Tente novamente."}
      </p>

      {aoTentarDeNovo && (
        <button
          type="button"
          onClick={aoTentarDeNovo}
          className="text-sm font-medium text-rose-800 underline underline-offset-4 hover:text-rose-950"
        >
          Tentar de novo
        </button>
      )}
    </div>
  );
}
