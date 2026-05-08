import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#EEF2FF',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <div style={{background:'#fff',borderRadius:'16px',border:'0.5px solid #E5E7EB',padding:'28px',width:'100%',maxWidth:'380px'}}>
        <div style={{width:'52px',height:'52px',borderRadius:'14px',background:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
          <i className="ti ti-briefcase" style={{fontSize:'24px',color:'#fff'}}></i>
        </div>
        <h1 style={{fontSize:'20px',fontWeight:'500',textAlign:'center',marginBottom:'4px'}}>WorkFlow</h1>
        <p style={{fontSize:'13px',color:'#6B7280',textAlign:'center',marginBottom:'24px'}}>Accede a tu registro de actividades</p>

        <div style={{marginBottom:'14px'}}>
          <div style={{fontSize:'11px',fontWeight:'500',color:'#6B7280',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'6px'}}>Correo electrónico</div>
          <div style={{display:'flex',alignItems:'center',border:'1px solid #D1D5DB',borderRadius:'10px',padding:'0 12px',height:'44px',gap:'8px'}}>
            <i className="ti ti-mail" style={{fontSize:'16px',color:'#9CA3AF'}}></i>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="nombre@empresa.com"
              style={{border:'none',outline:'none',fontSize:'14px',color:'#111827',background:'transparent',flex:1}} />
          </div>
        </div>

        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'11px',fontWeight:'500',color:'#6B7280',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'6px'}}>Contraseña</div>
          <div style={{display:'flex',alignItems:'center',border:'1px solid #D1D5DB',borderRadius:'10px',padding:'0 12px',height:'44px',gap:'8px'}}>
            <i className="ti ti-lock" style={{fontSize:'16px',color:'#9CA3AF'}}></i>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••"
              style={{border:'none',outline:'none',fontSize:'14px',color:'#111827',background:'transparent',flex:1}}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
        </div>

        {error && <p style={{fontSize:'13px',color:'#DC2626',marginBottom:'12px',textAlign:'center'}}>{error}</p>}

        <button onClick={handleLogin} disabled={loading}
          style={{width:'100%',height:'44px',background:'#2563EB',color:'#fff',border:'none',borderRadius:'10px',fontSize:'14px',fontWeight:'500',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',opacity:loading?0.7:1}}>
          {loading ? 'Entrando...' : 'Entrar'} {!loading && <i className="ti ti-arrow-right" style={{fontSize:'15px'}}></i>}
        </button>
      </div>
    </div>
  )
}
