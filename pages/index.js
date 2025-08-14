export default function Home() {
  async function go(e) {
    e.preventDefault();
    const file = document.getElementById('f').files?.[0];
    if (!file) return alert('Choose a .docx');
    if (!file.name.endsWith('.docx')) return alert('Only .docx');

    const fd = new FormData();
    fd.append('file', file);

    const url = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/,'') + '/format';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'X-App-Token': process.env.NEXT_PUBLIC_APP_TOKEN },
      body: fd
    });

    if (!res.ok) return alert('Backend error');

    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = file.name.replace(/\.docx$/, '') + '.hsu.docx';
    document.body.appendChild(a); a.click(); a.remove();
  }

  return (
    <main style={{maxWidth:600,margin:'40px auto',fontFamily:'system-ui'}}>
      <h1>ADB HSU Formatter</h1>
      <p>Upload a .docx → get an HSU-formatted .docx back.</p>
      <form onSubmit={go} style={{border:'1px solid #ddd',padding:16,borderRadius:12}}>
        <input id="f" type="file" accept=".docx" />
        <div style={{marginTop:12}}>
          <button type="submit">Format & Download</button>
        </div>
      </form>
    </main>
  );
}
