import { STATUS_PEDIDO } from "../../utils/pedido";

// Etiqueta colorida com a situação do pedido (aguardando pagamento, pago, enviado...)
export default function SeloStatus({ status }) {
  const { rotulo, classe } = STATUS_PEDIDO[status] ?? { rotulo: status, classe: "bg-stone-100 text-stone-600 ring-stone-200" };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${classe}`}>
      {rotulo}
    </span>
  );
}
