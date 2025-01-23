import React, { useState } from 'react';
import { 
    Bell, Star, Zap, Rocket,  Shield, 
    Globe, 
    MessageCircle, ChartLine, Cloud 
  } from 'lucide-react';
  
import '../styles/pages/premiums.css'

const colors = {
  primary: "#242d39",
  textPrimary: "rgba(248, 250, 252, 1)",
  textSecondary: "rgba(127, 127, 127, 1)",
  accent: "#496BCC",
  danger: "rgb(255, 82, 82)",
  success: "#0FB14D",
  divider: "rgba(248, 250, 252, 0.05)"
};

interface PremiumItem {
  id: number;
  title: string;
  description: string;
  price: number;
  icon: React.ElementType;
  type: 'telegram' | 'stratosphere';
}


  const premiumItems: PremiumItem[] = [
    // Telegram Premium Options
    { 
      id: 1, 
      title: 'Telegram Premium', 
      description: 'Exclusive features & no ads', 
      price: 5.99, 
      icon: Bell,
      type: 'telegram'
    },
    { 
      id: 2, 
      title: 'Advanced Messaging', 
      description: '4x larger file uploads', 
      price: 3.99, 
      icon: Zap,
      type: 'telegram'
    },
    { 
      id: 3, 
      title: 'Chat Privacy', 
      description: 'Advanced encryption & hidden status', 
      price: 4.49, 
      icon: Shield,
      type: 'telegram'
    },
    { 
      id: 4, 
      title: 'Voice Boost', 
      description: 'Enhanced voice message features', 
      price: 2.99, 
      icon: MessageCircle,
      type: 'telegram'
    },
    { 
      id: 5, 
      title: 'Global Translator', 
      description: 'Real-time message translation', 
      price: 6.49, 
      icon: Globe,
      type: 'telegram'
    },
  
    // Stratosphere Premium Options
    { 
      id: 6, 
      title: 'Stratosphere Pro', 
      description: 'Enhanced wallet features', 
      price: 9.99, 
      icon: Star,
      type: 'stratosphere'
    },
    { 
      id: 7, 
      title: 'Crypto Insights', 
      description: 'Real-time market analysis', 
      price: 14.99, 
      icon: Rocket,
      type: 'stratosphere'
    },
    { 
      id: 8, 
      title: 'Portfolio Guardian', 
      description: 'Advanced risk management', 
      price: 19.99, 
      icon: Shield,
      type: 'stratosphere'
    },
    { 
      id: 9, 
      title: 'Trading Signals', 
      description: 'AI-powered trading recommendations', 
      price: 24.99, 
      icon: ChartLine,
      type: 'stratosphere'
    },
    { 
      id: 10, 
      title: 'Cloud Backup', 
      description: 'Secure wallet & asset backup', 
      price: 7.99, 
      icon: Cloud,
      type: 'stratosphere'
    }
  ];

const Premiums: React.FC = () => {
  const [activeType, setActiveType] = useState<'telegram' | 'stratosphere'>('telegram');

  const filteredItems = premiumItems.filter(item => item.type === activeType);

  return (
    <div 
      className="premium-container" 
      style={{ 
        backgroundColor: colors.primary, 
        color: colors.textPrimary 
      }}
    >
      <div className="premium-toggle">
        <button 
          onClick={() => setActiveType('telegram')}
          className={activeType === 'telegram' ? 'active' : ''}
          style={{
            backgroundColor: activeType === 'telegram' ? colors.accent : 'transparent',
            color: activeType === 'telegram' ? colors.textPrimary : colors.textSecondary
          }}
        >
          Telegram Premium
        </button>
        <button 
          onClick={() => setActiveType('stratosphere')}
          className={activeType === 'stratosphere' ? 'active' : ''}
          style={{
            backgroundColor: activeType === 'stratosphere' ? colors.accent : 'transparent',
            color: activeType === 'stratosphere' ? colors.textPrimary : colors.textSecondary
          }}
        >
          Stratosphere Premium
        </button>
      </div>

      <div className="premium-grid">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className="premium-card"
              style={{ 
                borderColor: colors.divider,
                backgroundColor: colors.primary
              }}
            >
              <div className="card-header">
                <Icon 
                  size={32} 
                  color={colors.accent} 
                  strokeWidth={1.5} 
                />
                <h3>{item.title}</h3>
              </div>
              <p className="card-description">{item.description}</p>
              <div className="card-footer">
                <span className="price">${item.price}/month</span>
                <button 
                  className="buy-button"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.textPrimary
                  }}
                >
                  Purchase
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Premiums;