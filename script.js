// Small client-side handlers for demo forms
document.addEventListener('DOMContentLoaded',()=>{
  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();

  const signin = document.getElementById('signin-form');
  if(signin) signin.addEventListener('submit', e=>{
    e.preventDefault();
    const f = new FormData(signin); const email = f.get('email');
    alert(`Signed in as ${email}. (Demo only)`);
    signin.reset();
  });

  const register = document.getElementById('register-form');
  if(register) register.addEventListener('submit', e=>{
    e.preventDefault();
    const f = new FormData(register); const pass = f.get('password'); const confirm = f.get('confirm');
    if(pass !== confirm){ alert('Passwords do not match'); return }
    alert('Registration successful (demo). Please check your email for verification.');
    register.reset();
  });

  // Theme selector removed — background is set via `styles.css` or by editing the file directly.

  // Radar widget (demo - client side only)
  const radar = document.getElementById('radar');
  const radarBlips = document.getElementById('radar-blips');
  const radarToggle = document.getElementById('radar-toggle');
  const radarClear = document.getElementById('radar-clear');
  const radarSoundToggle = document.getElementById('radar-sound-toggle');
  const radarVolume = document.getElementById('radar-volume');
  let scanning = false; let radarInterval = null;
  let audioCtx = null; let masterGain = null; let sweepOsc = null; let soundEnabled = true;
  let welcomePlayed = false;

  function addBlip(xPct, yPct, label){
    if(!radarBlips) return;
    const b = document.createElement('div');
    b.className = 'radar-blip';
    b.style.left = xPct + '%';
    b.style.top = yPct + '%';
    const distPct = Math.min(100, Math.hypot(xPct-50, yPct-50));
    const meters = Math.round((distPct/50)*25); // map 0-50pct to 0-25 meters
    const labelText = label ? `${label} — ${meters}m` : `${meters}m`;
    const lbl = document.createElement('div'); lbl.className='label'; lbl.textContent = labelText;
    b.appendChild(lbl);
    radarBlips.appendChild(b);
    // animate in
    requestAnimationFrame(()=> b.classList.add('active'));
    // play sound ping with pan and pitch based on position/distance
    if(soundEnabled) {
      const pan = (xPct - 50) / 50; // -1 .. 1
      const freq = 1200 - Math.min(900, meters * 30); // closer -> higher pitch
      playPing(pan, freq, 0.12);
    }
    // remove after a while
    setTimeout(()=>{ b.classList.remove('active'); setTimeout(()=>b.remove(),500) }, 8000);
  }

  function randomBlip(){
    // bias toward edges to feel more 'detection'
    const r = Math.random();
    const radius = 40 + Math.pow(r,0.6) * 48; // px-ish mapped to percent
    const angle = Math.random() * Math.PI * 2;
    const cx = 50 + Math.cos(angle) * radius * 0.9 / 1.6;
    const cy = 50 + Math.sin(angle) * radius * 0.9 / 1.6;
    const ghosts = ['Phantom','Poltergeist','Wisp','Shadow','Apparition'];
    addBlip(cx, cy, ghosts[Math.floor(Math.random()*ghosts.length)]);
  }

  function ensureAudio(){
    if(audioCtx) return;
    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain(); masterGain.gain.value = Number(radarVolume ? radarVolume.value : 0.6);
      masterGain.connect(audioCtx.destination);
    }catch(e){ console.warn('Audio unavailable',e); soundEnabled=false }
  }

  function playPing(panVal=0, frequency=800, duration=0.12){
    try{
      ensureAudio(); if(!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator(); osc.type='sine'; osc.frequency.value = frequency;
      const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.6, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      const panner = audioCtx.createStereoPanner(); panner.pan.value = panVal;
      osc.connect(gain); gain.connect(panner); panner.connect(masterGain);
      osc.start(now); osc.stop(now + duration + 0.02);
    }catch(e){console.warn('ping failed',e)}
  }

  function startSweep(){
    ensureAudio(); if(!audioCtx || sweepOsc) return;
    sweepOsc = audioCtx.createOscillator(); sweepOsc.type='sine'; sweepOsc.frequency.value = 80;
    const g = audioCtx.createGain(); g.gain.value = 0.02;
    sweepOsc.connect(g); g.connect(masterGain);
    sweepOsc.start();
  }

  function stopSweep(){ if(sweepOsc){ try{ sweepOsc.stop(); }catch(e){} sweepOsc.disconnect(); sweepOsc=null } }

  // Welcome message (tries to speak immediately; if blocked, will wait for first user gesture)
  function speakWelcome(){
    if(welcomePlayed) return; welcomePlayed = true;
    const msg = 'Welcome to the professional Ghost Busters.';
    // Prefer SpeechSynthesis when available
    try{
      if('speechSynthesis' in window){
        const utter = new SpeechSynthesisUtterance(msg);
        // make welcome speech as loud as possible
        utter.volume = 1.0;
        window.speechSynthesis.speak(utter);
        return;
      }
    }catch(e){ /* fallthrough */ }
    // fallback to a short ping sequence
    if(soundEnabled) {
      // ensure audio is initialized and temporarily boost master gain for the welcome pings
      ensureAudio();
      try{
        const prev = masterGain ? masterGain.gain.value : null;
        // user requested a very large boost ("700"); interpret as gain factor ~7 (700%)
        const boost = 7.0;
        if(masterGain) masterGain.gain.value = boost;
        playPing(0,1400,0.16);
        setTimeout(()=>playPing(0,1000,0.18),260);
        setTimeout(()=>{ if(masterGain && prev !== null) masterGain.gain.value = prev }, 1000);
      }catch(e){
        // fallback to normal pings if gain manipulation fails
        playPing(0,1000,0.12);
        setTimeout(()=>playPing(0,700,0.14),180);
      }
    }
  }

  // try to speak on load; if blocked, attach a one-time interaction listener
  try{ if(soundEnabled) speakWelcome(); }catch(e){ }
  // If speech didn't play (browsers may require gesture), play on first interaction
  function ensureWelcomeOnInteraction(){
    if(welcomePlayed) return;
    const onFirst = ()=>{ speakWelcome(); window.removeEventListener('pointerdown', onFirst); window.removeEventListener('keydown', onFirst); };
    window.addEventListener('pointerdown', onFirst);
    window.addEventListener('keydown', onFirst);
  }
  ensureWelcomeOnInteraction();

  function startRadar(){
    if(!radar) return;
    radar.classList.add('scanning');
    radarToggle.textContent = 'Stop Scan';
    scanning = true;
    radarInterval = setInterval(randomBlip, 1200 + Math.random()*1200);
    if(soundEnabled) startSweep();
  }

  function stopRadar(){
    if(!radar) return;
    radar.classList.remove('scanning');
    radarToggle.textContent = 'Start Scan';
    scanning = false;
    clearInterval(radarInterval); radarInterval = null;
    stopSweep();
  }

  if(radarToggle){
    radarToggle.addEventListener('click', ()=>{
      if(scanning) stopRadar(); else startRadar();
    });
  }
  if(radarClear){ radarClear.addEventListener('click', ()=>{ if(radarBlips) radarBlips.innerHTML=''; }); }
  if(radarSoundToggle){ radarSoundToggle.addEventListener('click', ()=>{
    // toggle audio on user gesture
    soundEnabled = !soundEnabled;
    radarSoundToggle.setAttribute('aria-pressed', String(soundEnabled));
    radarSoundToggle.textContent = soundEnabled ? 'Sound On' : 'Sound Off';
    if(soundEnabled){ ensureAudio(); if(scanning) startSweep() } else { stopSweep() }
  }); }
  if(radarVolume) radarVolume.addEventListener('input', ()=>{ if(masterGain) masterGain.gain.value = Number(radarVolume.value) });

  // allow clicking on radar to place a manual blip
  if(radar && radarBlips){
    radar.addEventListener('click',(ev)=>{
      const rect = radar.getBoundingClientRect();
      const x = ((ev.clientX - rect.left)/rect.width)*100;
      const y = ((ev.clientY - rect.top)/rect.height)*100;
      addBlip(x,y,'Manual ping');
    });
  }

});
