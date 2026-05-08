import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [actividades, setActividades] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [imagenes, setImagenes] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [vista, setVista] = useState('hoy')
  const [user, setUser] = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    fetchActividades()
  }, [vista])

  const fetchActividades = async () => {
    let query = supabase
      .from('actividades')
      .select('*')
      .order('fecha_hora', { ascending: false })
    if (vista === 'hoy') {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      query = query.gte('fecha_hora', hoy.toISOString())
    }
    const { data } = await query
    setActividades(data || [])
  }

  const handleImagenes = (files) => {
    const arr = Array.from(files)
    setImagenes(arr)
    setPreviews(arr.map(f => URL.createObjectURL(f)))
  }

  const guardar = async () => {
    if (!titulo.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    let urls = []
    for (const file of imagenes) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('imagenes').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('imagenes').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
    }

    await supabase.from('actividades').insert({
      titulo,
      descripcion,
      user_id: user.id,
      fecha_hora: new Date().toISOString(),
      imagenes: urls
    })

    setTitulo('')
    setDescripcion('')
    setImagenes([])
    setPreviews([])
    fetchActividades()
    setLoading(false)
  }

  const eliminar = async (id, imgs) => {
    await supabase.from('actividades').delete().eq('id', id)
    fetchActividades()
  }

  const agruparPorDia = (lista) => {
    const grupos = {}
    lista.forEach(a => {
      const fecha = new Date(a.fecha_hora).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
      if (!grupos[fecha]) grupos[fecha] = []
      grupos[fecha].push(a)
    })
    return grupos
  }

  const grupos = agruparPorDia(actividades)

  return (
    <div style={{minHeight:'100vh',background:'#EEF2FF',padding:'16px'}}>
      <div style={{maxWidth:'720px',margin:'0 auto'}}>

        <div style={{background:'#fff',borderRadius:'12px',border:'0.5px solid #E5E7EB',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'7px',background:'#2563EB',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <i className="ti ti-briefcase" style={{fontSize:'14px',color:'#fff'}}></i>
            </div>
            <span style={{fontSize:'14px',fontWeight:'500',color:'#111827'}}>WorkFlow</span>
          </div>
          <div style={{display:'flex',gap:'4px'}}>
            <button onClick={() => setVista('hoy')}
              style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',border:'none',background:vista==='hoy'?'#EFF6FF':'transparent',color:vista==='hoy'?'#2563EB':'#6B7280',cursor:'pointer',fontWeight:vista==='hoy'?'500':'400'}}>
              Hoy
            </button>
            <button onClick={() => setVista('historial')}
              style={{fontSize:'12px',padding:'5px 12px',borderRadius:'8px',border:'none',background:vista==='historial'?'#EFF6FF':'transparent',color:vista==='historial'?'#2563EB':'#6B7280',cursor:'pointer',fontWeight:vista==='historial'?'500':'400'}}>
              Historial
            </button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#DBEAFE',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:'500',color:'#1D4ED8'}}>
              {user?.email?.[0].toUpperCase()}
            </div>
            <button onClick={() => supabase.auth.signOut()}
              style={{background:'transparent',border:'none',cursor:'pointer',color:'#9CA3AF'}}>
              <i className="ti ti-logout" style={{fontSize:'16px'}}></i>
            </button>
          </div>
        </div>

        <div style={{background:'#F8FAFC',border:'1px solid #E5E7EB',borderRadius:'12px',padding:'14px',marginBottom:'16px'}}>
          <div style={{fontSize:'13px',fontWeight:'500',color:'#111827',marginBottom:'12px',display:'flex',alignItems:'center',gap:'6px'}}>
            <i className="ti ti-plus" style={{fontSize:'14px',color:'#2563EB'}}></i> Nueva actividad
          </div>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título"
            style={{width:'100%',border:'1px solid #D1D5DB',borderRadius:'8px',padding:'7px 10px',fontSize:'13px',color:'#111827',background:'#fff',marginBottom:'10px',boxSizing:'border-box'}} />
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción (opcional)" rows={3}
            style={{width:'100%',border:'1px solid #D1D5DB',borderRadius:'8px',padding:'7px 10px',fontSize:'13px',color:'#111827',background:'#fff',marginBottom:'10px',resize:'none',boxSizing:'border-box'}} />

          <div onClick={() => fileRef.current.click()}
            style={{border:'1.5px dashed #D1D5DB',borderRadius:'8px',padding:'12px',textAlign:'center',fontSize:'12px',color:'#9CA3AF',marginBottom:'10px',cursor:'pointer'}}>
            <i className="ti ti-upload" style={{fontSize:'18px',display:'block',marginBottom:'4px'}}></i>
            Arrastra imágenes o haz clic para subir
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleImagenes(e.target.files)} style={{display:'none'}} />

          {previews.length > 0 && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'10px'}}>
              {previews.map((src, i) => (
                <img key={i} src={src} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'8px',border:'0.5px solid #E5E7EB'}} />
              ))}
            </div>
          )}

          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button onClick={guardar} disabled={loading || !titulo.trim()}
              style={{fontSize:'12px',padding:'6px 16px',borderRadius:'8px',border:'none',background:'#2563EB',color:'#fff',cursor:'pointer',fontWeight:'500',opacity:loading||!titulo.trim()?0.6:1}}>
              {loading ? 'Guardando...' : 'Guardar actividad'}
            </button>
          </div>
        </div>

        {Object.keys(grupos).length === 0 && (
          <div style={{textAlign:'center',padding:'40px',color:'#9CA3AF',fontSize:'13px'}}>
            {vista === 'hoy' ? 'No hay actividades registradas hoy' : 'No hay actividades en el historial'}
          </div>
        )}

        {Object.entries(grupos).map(([fecha, items]) => (
          <div key={fecha} style={{marginBottom:'16px'}}>
            <div style={{fontSize:'12px',fontWeight:'500',color:'#6B7280',marginBottom:'8px',display:'flex',justifyContent:'space-between'}}>
              <span>{fecha}</span>
              <span style={{color:'#9CA3AF',fontWeight:'400'}}>{items.length} actividad{items.length !== 1 ? 'es' : ''}</span>
            </div>
            {items.map(a => (
              <div key={a.id} style={{background:'#fff',border:'0.5px solid #E5E7EB',borderRadius:'12px',padding:'12px 14px',marginBottom:'8px'}}>
                <div style={{display:'flex',gap:'12px'}}>
                  <div style={{fontSize:'11px',color:'#9CA3AF',minWidth:'40px',paddingTop:'2px'}}>
                    {new Date(a.fecha_hora).toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit'})}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'13px',fontWeight:'500',color:'#111827',marginBottom:'2px'}}>{a.titulo}</div>
                    {a.descripcion && <div style={{fontSize:'12px',color:'#6B7280',lineHeight:'1.4'}}>{a.descripcion}</div>}
                  </div>
                  <button onClick={() => eliminar(a.id, a.imagenes)}
                    style={{background:'transparent',border:'none',cursor:'pointer',color:'#D1D5DB',alignSelf:'flex-start'}}>
                    <i className="ti ti-trash" style={{fontSize:'14px'}}></i>
                  </button>
                </div>
                {a.imagenes && a.imagenes.length > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginTop:'10px',marginLeft:'52px'}}>
                    {a.imagenes.map((url, i) => (
                      <img key={i} src={url} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'8px',border:'0.5px solid #E5E7EB',cursor:'pointer'}}
                        onClick={() => window.open(url, '_blank')} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
