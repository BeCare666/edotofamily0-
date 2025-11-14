export default function ProductCard({ product }) {
  return (
    <div className="card p-4 rounded-2xl shadow flex flex-col">
      <div className="flex-1">
        <h3 className="font-semibold text-lg text-[#4B5563]">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-2">{product.desc}</p>
        <p className="text-xs text-gray-500 mt-2">Posologie: {product.posologie}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-[#FF6EA9]">{product.price.toFixed(2)} €</span>
      </div>
    </div>
  )
}