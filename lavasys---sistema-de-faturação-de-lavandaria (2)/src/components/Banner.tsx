import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export const Banner: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-xl mb-8"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-200" />
          <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">Bem-vindo ao LavaSys</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Gestão Inteligente para sua Lavandaria</h1>
        <p className="text-blue-100 max-w-2xl">
          Controle seus pedidos, clientes e faturamento em um só lugar com eficiência e elegância.
        </p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
    </motion.div>
  );
};
