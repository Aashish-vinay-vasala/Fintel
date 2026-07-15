import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShieldAlert, CreditCard, Scale, Activity, FileText,
  Settings, LogOut, Zap, ScanSearch, FileBarChart2, Landmark,
  Users, BarChart2, Package, Cpu, TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const GROUPS = [
  { label: 'Core', items: [
    { to: '/',      icon: LayoutDashboard, label: 'Overview'    },
    { to: '/fraud', icon: ShieldAlert,     label: 'Fraud Intel' },
  ]},
  { label: 'Risk & Lending', items: [
    { to: '/credit-suite', icon: CreditCard, label: 'Credit Suite'  },
    { to: '/risk',         icon: Activity,   label: 'Risk'          },
    { to: '/loans',        icon: Landmark,   label: 'Loan Monitor'  },
    { to: '/treasury',     icon: TrendingUp, label: 'Treasury'      },
  ]},
  { label: 'Compliance', items: [
    { to: '/compliance-hub', icon: Scale,      label: 'Compliance Hub' },
    { to: '/aml',            icon: ScanSearch, label: 'AML Intel'      },
    { to: '/model-risk',     icon: Cpu,        label: 'Model Risk'     },
  ]},
  { label: 'Intelligence', items: [
    { to: '/customer-intel', icon: Users,    label: 'Customer Intel' },
    { to: '/benchmarking',   icon: BarChart2, label: 'Benchmarking'  },
    { to: '/risk-assets',    icon: Package,  label: 'Risk Assets'   },
  ]},
  { label: 'Tools', items: [
    { to: '/reports',   icon: FileBarChart2, label: 'Report Studio' },
    { to: '/documents', icon: FileText,      label: 'Doc AI'        },
  ]},
];

function NavItem({ to, icon: Icon, label }) {
  const [hov, setHov] = useState(false);
  return (
    <NavLink to={to} end={to === '/'}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '7px 11px', borderRadius: 9,
        textDecoration: 'none', marginBottom: 1,
        transition: 'all 0.17s cubic-bezier(.4,0,.2,1)',
        fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500,
        letterSpacing: '-0.1px',
        background: isActive
          ? 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.20) 100%)'
          : hov ? 'rgba(255,255,255,0.06)' : 'transparent',
        color: isActive ? '#E0E7FF' : hov ? '#C7D2FE' : '#64748B',
        borderLeft: isActive ? '2px solid #818CF8' : '2px solid transparent',
        boxShadow: isActive ? '0 0 20px rgba(99,102,241,0.15)' : 'none',
        paddingLeft: isActive ? 9 : 11,
      })}>
      <Icon size={14} strokeWidth={1.9} style={{ flexShrink: 0 }} />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: 'linear-gradient(180deg, #080C18 0%, #0A0E1C 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', padding: '18px 10px 14px',
      position: 'relative', zIndex: 100,
    }}>

      {/* Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, paddingLeft:4 }}>
        <div style={{
          width:36, height:36, flexShrink:0,
          background:'linear-gradient(140deg, #6366F1, #8B5CF6)',
          borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 4px 18px rgba(99,102,241,0.50), inset 0 1px 0 rgba(255,255,255,0.20)',
        }}>
          <Zap size={15} color="#fff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:16.5, letterSpacing:'-0.5px', color:'#E0E7FF', lineHeight:1 }}>
            Vault<span style={{ background:'linear-gradient(135deg,#818CF8,#A78BFA)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>IQ</span>
          </div>
          <div style={{ fontSize:8, color:'#334155', letterSpacing:'1.2px', marginTop:4, fontWeight:700, textTransform:'uppercase', fontFamily:'var(--font)' }}>
            AI Banking OS
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto' }}>
        {GROUPS.map((g, gi) => (
          <div key={gi} style={{ marginBottom:4 }}>
            <div style={{
              fontSize:8.5, fontWeight:700, color:'#1E293B',
              letterSpacing:'0.9px', textTransform:'uppercase',
              padding: gi===0 ? '0 6px 5px' : '10px 6px 5px',
              fontFamily:'var(--font)',
            }}>
              {g.label}
            </div>
            {g.items.map(i => <NavItem key={i.to} {...i} />)}
          </div>
        ))}
      </nav>

      <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(99,102,241,0.20),transparent)', margin:'8px 4px' }} />

      <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
        {[
          { icon:Settings, label:'Settings', to:'/settings' },
          { icon:LogOut,   label:'Sign Out', red:true },
        ].map(({ icon:Icon, label, to, red }) => (
          <button key={label} onClick={() => to ? navigate(to) : logout()} style={{
            display:'flex', alignItems:'center', gap:9, padding:'7px 11px',
            borderRadius:9, border:'none', background:'transparent', cursor:'pointer',
            color: red ? '#F87171' : '#475569', transition:'all 0.17s',
            fontFamily:'var(--font)', fontSize:13, fontWeight:500,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = red ? 'rgba(248,113,113,0.10)' : 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = red ? '#FCA5A5' : '#C7D2FE'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = red ? '#F87171' : '#475569'; }}
          >
            <Icon size={14} strokeWidth={1.9} style={{ flexShrink:0 }} />
            {label}
          </button>
        ))}
      </div>
    </aside>
  );
}
