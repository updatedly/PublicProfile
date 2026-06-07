export default function Loading() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'inline-block', width:'20px', height:'20px', border:'2px solid #2a2a2a', borderTopColor:'#c9a84c', borderRadius:'50%', animation:'spin .6s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
