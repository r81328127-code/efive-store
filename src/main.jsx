import React,{StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class AppErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:null}}
  static getDerivedStateFromError(error){return {error}}
  componentDidCatch(error){console.error('EFIVE application error:',error)}
  render(){
    if(!this.state.error)return this.props.children
    return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#f2eee8',padding:24}}>
      <div style={{maxWidth:520,width:'100%',background:'#fff',border:'1px solid #ded7ce',borderRadius:18,padding:28,boxShadow:'0 20px 60px rgba(0,0,0,.08)'}}>
        <div style={{fontSize:11,letterSpacing:'.18em',fontWeight:800,color:'#8f887f'}}>EFIVE STUDIO</div>
        <h1 style={{margin:'8px 0',fontFamily:'Georgia,serif',fontSize:28}}>We hit a temporary display error.</h1>
        <p style={{color:'#6f6962',lineHeight:1.6,marginBottom:18}}>The app did not render correctly. Reset the local designer state and try again.</p>
        <button type="button" onClick={()=>{localStorage.removeItem('efive_room_designs');localStorage.removeItem('efive-studio-layouts');window.location.reload()}} style={{border:0,borderRadius:10,background:'#171615',color:'#fff',padding:'11px 16px',cursor:'pointer',fontWeight:700}}>Reset & reload</button>
      </div>
    </div>
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
