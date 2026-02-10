// src/components/blog/BlogHero.jsx
import { motion } from "framer-motion";

const BlogHero = () => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-[#f7f6fb] to-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto text-center px-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-[#231746]">
          Our Insights
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Ideas, stories & perspectives from WeInsightians
        </p>
      </motion.div>
    </section>
  );
};

export default BlogHero;
