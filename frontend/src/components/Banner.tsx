import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { LaundrySettings } from '../types';

const DEFAULT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=1600&q=80';

interface BannerProps {
  settings: LaundrySettings;
  onClose?: () => void;
}

export const Banner: React.FC<BannerProps> = ({ settings, onClose }) => {
  const bannerImage = settings.landingBannerImage?.trim() || DEFAULT_BANNER_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[28px] p-8 md:p-10 text-white shadow-2xl mb-8 border border-white/20"
    >
      <img src={bannerImage} alt="Banner da lavandaria" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0e2a47]/90 via-[#163b63]/80 to-[#4ea9d9]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_48%)]" />

      <div className="relative z-10">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Fechar notificação de boas-vindas"
            title="Fechar"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#bfe4fb]" />
          <span className="text-[#d9efff] text-sm font-semibold tracking-wide uppercase">
            Bem-vindo ao Sistema de Lavandaria GenOmni
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Gestão inteligente, elegante e rápida para a sua lavandaria</h1>
        <p className="text-[#e6f5ff] max-w-3xl">
          Controle pedidos, clientes, faturação e suporte técnico com uma experiência moderna e feita para operação real.
        </p>
      </div>
    </motion.div>
  );
};
