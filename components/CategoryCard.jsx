import { motion } from 'framer-motion'

export default function CategoryCard({ title, image, id }) {
  return (
    <motion.div
      whileHover={{ scale: 1.08, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.12))' }}
      className="w-20 h-20 rounded-full bg-white/90 shadow-md flex flex-col items-center justify-center p-2"
    >
      <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-white">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <span className="block mt-2 text-center text-[10px] font-semibold text-gray-900 tracking-wide">
        {title}
      </span>

    </motion.div>

  )
  { /*[#FF6EA9]*/ }
}