// Screen Buddy — Desktop Pet with Full Character Illustrations
(function() {
  if (document.getElementById('__screenbuddy_pet')) return;

  // ── Pet Character SVGs (cute 2D illustrations) ──
  var CHARACTERS = {
    cat: {
      name: '猫咪', free: true,
      svg: '<svg viewBox="0 0 80 80"><defs><radialGradient id="catBody"><stop offset="0%" stop-color="#ffcc80"/><stop offset="100%" stop-color="#ff9800"/></radialGradient></defs>'+
        '<!-- Body --><ellipse cx="40" cy="48" rx="22" ry="20" fill="url(#catBody)"/>'+
        '<!-- Ears --><polygon points="22,28 18,12 32,26" fill="#ff9800"/><polygon points="58,28 62,12 48,26" fill="#ff9800"/>'+
        '<!-- Inner ears --><polygon points="24,26 22,16 30,25" fill="#ffb4a2"/><polygon points="56,26 58,16 50,25" fill="#ffb4a2"/>'+
        '<!-- Head --><circle cx="40" cy="34" r="18" fill="url(#catBody)"/>'+
        '<!-- Eyes --><ellipse cx="33" cy="33" rx="4" ry="5" fill="#333"/><ellipse cx="47" cy="33" rx="4" ry="5" fill="#333"/>'+
        '<!-- Eye shine --><circle cx="34" cy="31" r="1.5" fill="#fff"/><circle cx="48" cy="31" r="1.5" fill="#fff"/>'+
        '<!-- Nose --><ellipse cx="40" cy="39" rx="3" ry="2" fill="#ff6b6b"/>'+
        '<!-- Mouth --><path d="M36,42 Q40,46 44,42" fill="none" stroke="#555" stroke-width="1.2" stroke-linecap="round"/>'+
        '<!-- Whiskers --><line x1="16" y1="36" x2="28" y2="38" stroke="#ccc" stroke-width=".8"/><line x1="16" y1="40" x2="28" y2="40" stroke="#ccc" stroke-width=".8"/><line x1="52" y1="38" x2="64" y1="36" stroke="#ccc" stroke-width=".8"/><line x1="52" y1="40" x2="64" y1="40" stroke="#ccc" stroke-width=".8"/>'+
        '<!-- Tail --><path d="M58,52 Q72,44 68,56 Q66,64 60,60" fill="none" stroke="#ff9800" stroke-width="6" stroke-linecap="round"/>'+
        '<!-- Paws --><ellipse cx="32" cy="62" rx="6" ry="4" fill="#ffcc80"/><ellipse cx="48" cy="62" rx="6" ry="4" fill="#ffcc80"/>'+
        '</svg>',
      sounds: ['Meow~','Purr purr...','Nya~!'],
      scale: 1, bodyColor: '#ff9800'
    },
    dog: {
      name: '小狗', free: true,
      svg: '<svg viewBox="0 0 80 80"><defs><radialGradient id="dogBody"><stop offset="0%" stop-color="#f5d5a0"/><stop offset="100%" stop-color="#d4a76a"/></radialGradient></defs>'+
        '<!-- Body --><ellipse cx="40" cy="48" rx="20" ry="18" fill="url(#dogBody)"/>'+
        '<!-- Floppy ears --><ellipse cx="20" cy="24" rx="8" ry="14" fill="#b8860b" transform="rotate(-15,20,24)"/><ellipse cx="60" cy="24" rx="8" ry="14" fill="#b8860b" transform="rotate(15,60,24)"/>'+
        '<!-- Head --><circle cx="40" cy="32" r="17" fill="url(#dogBody)"/>'+
        '<!-- Eyes --><circle cx="33" cy="30" r="4" fill="#333"/><circle cx="47" cy="30" r="4" fill="#333"/>'+
        '<circle cx="34" cy="28" r="1.5" fill="#fff"/><circle cx="48" cy="28" r="1.5" fill="#fff"/>'+
        '<!-- Nose --><ellipse cx="40" cy="37" rx="4" ry="3" fill="#333"/>'+
        '<!-- Tongue --><ellipse cx="40" cy="43" rx="4" ry="5" fill="#ff6b6b"/><line x1="40" y1="38" x2="40" y2="47" stroke="#ff6b6b" stroke-width="1"/>'+
        '<!-- Tail --><path d="M56,50 Q72,44 66,36" fill="none" stroke="#d4a76a" stroke-width="5" stroke-linecap="round"/>'+
        '<!-- Paws --><ellipse cx="30" cy="62" rx="6" ry="4" fill="#f5d5a0"/><ellipse cx="50" cy="62" rx="6" ry="4" fill="#f5d5a0"/>'+
        '</svg>',
      sounds: ['Woof!','Pant pant!','Arf arf!'],
      scale: 1, bodyColor: '#d4a76a'
    },
    frog: {
      name: '青蛙', free: true,
      svg: '<svg viewBox="0 0 80 80"><defs><radialGradient id="frogBody"><stop offset="0%" stop-color="#81c784"/><stop offset="100%" stop-color="#4caf50"/></radialGradient></defs>'+
        '<!-- Body --><ellipse cx="40" cy="42" rx="22" ry="18" fill="url(#frogBody)"/>'+
        '<!-- Eyes (bulging) --><circle cx="28" cy="22" r="10" fill="#fff"/><circle cx="52" cy="22" r="10" fill="#fff"/>'+
        '<circle cx="28" cy="22" r="5" fill="#333"/><circle cx="52" cy="22" r="5" fill="#333"/>'+
        '<circle cx="29" cy="20" r="2" fill="#fff"/><circle cx="53" cy="20" r="2" fill="#fff"/>'+
        '<!-- Cheek blush --><circle cx="24" cy="36" r="5" fill="#ff9999" opacity=".4"/><circle cx="56" cy="36" r="5" fill="#ff9999" opacity=".4"/>'+
        '<!-- Mouth --><path d="M24,40 Q40,54 56,40" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round"/>'+
        '<!-- Belly --><ellipse cx="40" cy="48" rx="14" ry="10" fill="#c8e6c9"/>'+
        '<!-- Legs --><ellipse cx="26" cy="58" rx="8" ry="5" fill="#4caf50" transform="rotate(-20,26,58)"/>'+
        '<ellipse cx="54" cy="58" rx="8" ry="5" fill="#4caf50" transform="rotate(20,54,58)"/>'+
        '</svg>',
      sounds: ['Ribbit!','Croak!','Boing!'],
      scale: 1, bodyColor: '#4caf50'
    },
    panda: {
      name: '熊猫', premium: true,
      svg: '<svg viewBox="0 0 80 80"><defs><radialGradient id="pandaBody"><stop offset="0%" stop-color="#f0f0f0"/><stop offset="100%" stop-color="#e0e0e0"/></radialGradient></defs>'+
        '<!-- Body --><ellipse cx="40" cy="48" rx="22" ry="20" fill="url(#pandaBody)"/>'+
        '<!-- Ears --><circle cx="22" cy="18" r="8" fill="#333"/><circle cx="58" cy="18" r="8" fill="#333"/>'+
        '<!-- Head --><circle cx="40" cy="32" r="20" fill="url(#pandaBody)"/>'+
        '<!-- Eye patches --><ellipse cx="30" cy="31" rx="8" ry="9" fill="#333"/><ellipse cx="50" cy="31" rx="8" ry="9" fill="#333"/>'+
        '<!-- Eye whites --><circle cx="30" cy="31" r="3" fill="#fff"/><circle cx="50" cy="31" r="3" fill="#fff"/>'+
        '<!-- Nose --><ellipse cx="40" cy="38" rx="3" ry="2" fill="#333"/>'+
        '<!-- Mouth --><path d="M36,42 Q40,44 44,42" fill="none" stroke="#555" stroke-width="1"/>'+
        '<!-- Arms --><ellipse cx="22" cy="52" rx="7" ry="10" fill="#333" transform="rotate(10,22,52)"/>'+
        '<ellipse cx="58" cy="52" rx="7" ry="10" fill="#333" transform="rotate(-10,58,52)"/>'+
        '<!-- Feet --><ellipse cx="32" cy="64" rx="7" ry="5" fill="#333"/><ellipse cx="48" cy="64" rx="7" ry="5" fill="#333"/>'+
        '</svg>',
      sounds: ['Munch munch...','Zzz...','Grr...'], scale: 1
    },
    bunny: {
      name: '兔子', premium: true,
      svg: '<svg viewBox="0 0 80 80"><defs><radialGradient id="bunnyBody"><stop offset="0%" stop-color="#fce4ec"/><stop offset="100%" stop-color="#f8bbd0"/></radialGradient></defs>'+
        '<!-- Body --><ellipse cx="40" cy="48" rx="16" ry="18" fill="url(#bunnyBody)"/>'+
        '<!-- Long ears --><ellipse cx="28" cy="14" rx="6" ry="16" fill="#fce4ec"/><ellipse cx="52" cy="14" rx="6" ry="16" fill="#fce4ec"/>'+
        '<ellipse cx="28" cy="14" rx="3" ry="12" fill="#ffcdd2"/><ellipse cx="52" cy="14" rx="3" ry="12" fill="#ffcdd2"/>'+
        '<!-- Head --><circle cx="40" cy="36" r="16" fill="url(#bunnyBody)"/>'+
        '<!-- Eyes --><circle cx="34" cy="34" r="3" fill="#333"/><circle cx="46" cy="34" r="3" fill="#333"/>'+
        '<circle cx="35" cy="32" r="1" fill="#fff"/><circle cx="47" cy="32" r="1" fill="#fff"/>'+
        '<!-- Nose --><ellipse cx="40" cy="40" rx="2" ry="2" fill="#ff6b6b"/>'+
        '<!-- Whiskers --><line x1="28" y1="40" x2="18" y2="38" stroke="#ddd"/><line x1="28" y1="42" x2="18" y2="43" stroke="#ddd"/>'+
        '<line x1="52" y1="40" x2="62" y2="38" stroke="#ddd"/><line x1="52" y1="42" x2="62" y2="43" stroke="#ddd"/>'+
        '<!-- Tail --><circle cx="56" cy="52" r="5" fill="#fff"/>'+
        '<!-- Feet --><ellipse cx="32" cy="64" rx="6" ry="4" fill="#fce4ec"/><ellipse cx="48" cy="64" rx="6" ry="4" fill="#fce4ec"/>'+
        '</svg>',
      sounds: ['Hop hop!','Twitch!','Squeak!'], scale: 1
    },
    fox: {
      name: '狐狸', premium: true,
      svg: '<svg viewBox="0 0 80 80"><defs><radialGradient id="foxBody"><stop offset="0%" stop-color="#ff8a65"/><stop offset="100%" stop-color="#e64a19"/></radialGradient></defs>'+
        '<!-- Body --><ellipse cx="40" cy="48" rx="18" ry="18" fill="url(#foxBody)"/>'+
        '<!-- Big triangular ears --><polygon points="20,26 10,8 30,20" fill="#e64a19"/><polygon points="60,26 70,8 50,20" fill="#e64a19"/>'+
        '<polygon points="22,24 14,12 28,22" fill="#fff"/><polygon points="58,24 66,12 52,22" fill="#fff"/>'+
        '<!-- Head --><ellipse cx="40" cy="34" rx="16" ry="14" fill="url(#foxBody)"/>'+
        '<!-- White face --><ellipse cx="40" cy="39" rx="10" ry="8" fill="#fff"/>'+
        '<!-- Eyes --><ellipse cx="34" cy="33" rx="3" ry="4" fill="#333"/><ellipse cx="46" cy="33" rx="3" ry="4" fill="#333"/>'+
        '<circle cx="35" cy="31" r="1.2" fill="#fff"/><circle cx="47" cy="31" r="1.2" fill="#fff"/>'+
        '<!-- Nose --><circle cx="40" cy="39" r="2.5" fill="#333"/>'+
        '<!-- Big tail --><path d="M54,52 Q74,36 68,24 Q64,18 58,26 Q54,36 52,48" fill="#fff" stroke="#e64a19" stroke-width="2"/>'+
        '<!-- Paws --><ellipse cx="30" cy="62" rx="5" ry="3" fill="#e64a19"/><ellipse cx="50" cy="62" rx="5" ry="3" fill="#e64a19"/>'+
        '</svg>',
      sounds: ['Yip!','Awoo~','Hehe!'], scale: 1
    },
    owl: {
      name: '猫头鹰', premium: true,
      svg: '<svg viewBox="0 0 80 80"><defs><radialGradient id="owlBody"><stop offset="0%" stop-color="#b39ddb"/><stop offset="100%" stop-color="#7e57c2"/></radialGradient></defs>'+
        '<!-- Body --><ellipse cx="40" cy="46" rx="20" ry="22" fill="url(#owlBody)"/>'+
        '<!-- Belly feathers --><ellipse cx="40" cy="52" rx="12" ry="14" fill="#d1c4e9"/>'+
        '<!-- Feather pattern --><path d="M32,44 Q40,40 48,44" fill="none" stroke="#b39ddb" stroke-width="1.5"/><path d="M33,50 Q40,46 47,50" fill="none" stroke="#b39ddb" stroke-width="1.5"/><path d="M34,56 Q40,52 46,56" fill="none" stroke="#b39ddb" stroke-width="1.5"/>'+
        '<!-- Big round eyes --><circle cx="30" cy="30" r="9" fill="#fff"/><circle cx="50" cy="30" r="9" fill="#fff"/>'+
        '<circle cx="30" cy="30" r="5" fill="#fdd835"/><circle cx="50" cy="30" r="5" fill="#fdd835"/>'+
        '<circle cx="30" cy="30" r="2.5" fill="#333"/><circle cx="50" cy="30" r="2.5" fill="#333"/>'+
        '<!-- Beak --><polygon points="40,34 37,38 43,38" fill="#ff9800"/>'+
        '<!-- Ear tufts --><polygon points="22,16 18,6 26,14" fill="#7e57c2"/><polygon points="58,16 62,6 54,14" fill="#7e57c2"/>'+
        '<!-- Feet --><path d="M28,66 L24,72 L28,72" fill="none" stroke="#ff9800" stroke-width="2.5"/><path d="M52,66 L56,72 L52,72" fill="none" stroke="#ff9800" stroke-width="2.5"/>'+
        '</svg>',
      sounds: ['Hoot!','Hoo...','Twit-twoo!'], scale: 1
    },
    unicorn: {
      name: '独角兽', premium: true,
      svg: '<svg viewBox="0 0 80 80"><defs><radialGradient id="uniBody"><stop offset="0%" stop-color="#f3e5f5"/><stop offset="100%" stop-color="#ce93d8"/></radialGradient><linearGradient id="horn"><stop offset="0%" stop-color="#ffd54f"/><stop offset="50%" stop-color="#ff80ab"/><stop offset="100%" stop-color="#80d8ff"/></linearGradient></defs>'+
        '<!-- Body --><ellipse cx="40" cy="48" rx="18" ry="18" fill="url(#uniBody)"/>'+
        '<!-- Mane --><path d="M22,28 Q16,20 20,12 Q24,18 26,22" fill="#ce93d8"/><path d="M20,34 Q14,28 16,18 Q20,26 24,28" fill="#81d4fa"/>'+
        '<!-- Head --><circle cx="40" cy="32" r="14" fill="url(#uniBody)"/>'+
        '<!-- Horn --><polygon points="40,10 37,24 43,24" fill="url(#horn)"/>'+
        '<!-- Eyes --><circle cx="35" cy="32" r="3" fill="#333"/><circle cx="45" cy="32" r="3" fill="#333"/>'+
        '<circle cx="34" cy="30" r="1.2" fill="#fff"/><circle cx="44" cy="30" r="1.2" fill="#fff"/>'+
        '<!-- Blush --><circle cx="32" cy="37" r="3" fill="#f48fb1" opacity=".5"/><circle cx="48" cy="37" r="3" fill="#f48fb1" opacity=".5"/>'+
        '<!-- Mouth --><path d="M37,39 Q40,42 43,39" fill="none" stroke="#555" stroke-width="1"/>'+
        '<!-- Rainbow tail --><path d="M56,46 Q72,32 68,50 Q66,58 62,52 Q58,46 60,42" fill="none" stroke="#ff80ab" stroke-width="4" stroke-linecap="round"/>'+
        '<!-- Stars --><text x="20" y="14" font-size="6">✨</text><text x="62" y="20" font-size="4">⭐</text>'+
        '</svg>',
      sounds: ['Sparkle!','Neigh~','Magic!'], scale: 1
    },
    dragon: {
      name: '小龙', premium: true,
      svg: '<svg viewBox="0 0 80 80"><defs><radialGradient id="dragonBody"><stop offset="0%" stop-color="#a5d6a7"/><stop offset="100%" stop-color="#43a047"/></radialGradient></defs>'+
        '<!-- Body --><ellipse cx="40" cy="48" rx="20" ry="16" fill="url(#dragonBody)"/>'+
        '<!-- Spikes --><polygon points="24,34 20,24 30,32" fill="#ff7043"/><polygon points="32,26 30,16 38,26" fill="#ff7043"/><polygon points="46,26 48,16 42,24" fill="#ff7043"/><polygon points="54,32 58,24 50,28" fill="#ff7043"/>'+
        '<!-- Head --><ellipse cx="40" cy="32" rx="15" ry="13" fill="url(#dragonBody)"/>'+
        '<!-- Horns --><polygon points="30,22 26,10 34,20" fill="#ffa726"/><polygon points="50,22 54,10 46,20" fill="#ffa726"/>'+
        '<!-- Eyes --><circle cx="35" cy="30" r="3.5" fill="#fff"/><circle cx="45" cy="30" r="3.5" fill="#fff"/>'+
        '<circle cx="35" cy="30" r="2" fill="#333"/><circle cx="45" cy="30" r="2" fill="#333"/>'+
        '<!-- Nostrils --><circle cx="37" cy="36" r="1" fill="#2e7d32"/><circle cx="43" cy="36" r="1" fill="#2e7d32"/>'+
        '<!-- Wings --><path d="M20,48 Q10,34 18,28 Q22,36 26,40" fill="#81c784" opacity=".8"/><path d="M60,48 Q70,34 62,28 Q58,36 54,40" fill="#81c784" opacity=".8"/>'+
        '<!-- Fire puff --><circle cx="40" cy="44" r="4" fill="#ffcc02" opacity=".6"/><circle cx="38" cy="46" r="2" fill="#ff9800" opacity=".4"/>'+
        '<!-- Tail --><path d="M56,54 Q72,58 68,48" fill="none" stroke="#43a047" stroke-width="5" stroke-linecap="round"/>'+
        '</svg>',
      sounds: ['Rawr!','Fwoosh!','Grrr!'], scale: 1
    }
  };

  // ── State ──
  var state = {
    pet: 'cat',
    x: Math.random() * 300 + 60,
    y: window.innerHeight - 120,
    dir: 1,
    speed: 0.4,
    anim: 'idle',
    animTimer: 0,
    messageTimer: 0,
    awake: true,
    stats: { steps: 0, petted: 0, awakeMinutes: 0 },
    frame: 0
  };

  // ── Load & Init ──
  chrome.storage && chrome.storage.local.get(['pet','stats'], function(data) {
    if (data && data.pet && CHARACTERS[data.pet]) state.pet = data.pet;
    if (data && data.stats) state.stats = data.stats;
    init();
  });
  if (!chrome || !chrome.storage) init();

  function init() {
    createPet();
    setInterval(update, 60);
    setInterval(randomBehavior, 6000);
    setInterval(saveProgress, 60000);
  }

  // ── Create Pet Element ──
  var el, bubble, zzzEl, container;
  function createPet() {
    container = document.createElement('div');
    container.id = '__screenbuddy_pet';

    // Pet
    el = document.createElement('div');
    el.className = 'sb-pet';
    el.innerHTML = CHARACTERS[state.pet].svg;
    container.appendChild(el);

    // Speech bubble
    bubble = document.createElement('div');
    bubble.className = 'sb-bubble';
    container.appendChild(bubble);

    // Zzz particles
    zzzEl = document.createElement('div');
    zzzEl.className = 'sb-zzz';
    zzzEl.textContent = '💤';
    container.appendChild(zzzEl);

    document.body.appendChild(container);

    // Events
    el.addEventListener('click', onPetClick);
    el.addEventListener('dblclick', onPetDblClick);

    // Drag
    var dragging = false, dx, dy;
    el.addEventListener('mousedown', function(e) {
      dragging = true; dx = e.clientX - state.x; dy = e.clientY - state.y;
      e.preventDefault();
      el.style.transition = 'none';
    });
    el.addEventListener('touchstart', function(e) {
      dragging = true; var t = e.touches[0];
      dx = t.clientX - state.x; dy = t.clientY - state.y;
      el.style.transition = 'none';
    });
    document.addEventListener('mousemove', function(e) {
      if (!dragging) return;
      state.x = e.clientX - dx; state.y = e.clientY - dy;
      el.style.left = state.x + 'px'; el.style.top = state.y + 'px';
    });
    document.addEventListener('touchmove', function(e) {
      if (!dragging) return;
      var t = e.touches[0];
      state.x = t.clientX - dx; state.y = t.clientY - dy;
      el.style.left = state.x + 'px'; el.style.top = state.y + 'px';
    });
    document.addEventListener('mouseup', function(){ if (dragging) { dragging = false; el.style.transition = 'transform 0.15s ease'; } });
    document.addEventListener('touchend', function(){ if (dragging) { dragging = false; el.style.transition = 'transform 0.15s ease'; } });

    el.style.left = state.x + 'px';
    el.style.top = state.y + 'px';
  }

  function updatePetSVG() {
    el.innerHTML = CHARACTERS[state.pet].svg;
  }

  // ── Main Loop ──
  function update() {
    if (!el) return;
    state.frame++;
    var maxW = window.innerWidth - 80;
    var maxH = window.innerHeight - 80;

    // Walking
    if (state.anim === 'walk') {
      state.x += state.speed * state.dir * 4;
      // Bounce while walking
      el.style.transform = 'translateY(' + Math.sin(state.frame * 0.3) * 4 + 'px) scaleX(' + state.dir + ')';
      if (state.x > maxW) { state.dir = -1; }
      if (state.x < 10) { state.dir = 1; }
      state.x = Math.max(10, Math.min(maxW, state.x));
      state.stats.steps++;
    }

    // Jumping
    if (state.anim === 'jump') {
      var jumpY = -Math.sin(state.animTimer * 0.15) * 50;
      el.style.transform = 'translateY(' + jumpY + 'px) scaleX(' + state.dir + ') scaleY(' + (1 + Math.sin(state.animTimer * 0.15) * 0.15) + ')';
      state.animTimer--;
      if (state.animTimer <= 0) { state.anim = 'idle'; el.style.transform = ''; }
    }

    // Happy
    if (state.anim === 'happy') {
      el.style.transform = 'scale(' + (1 + Math.sin(state.animTimer * 0.4) * 0.15) + ') translateY(' + Math.sin(state.animTimer * 0.5) * 6 + 'px)';
      state.animTimer--;
      if (state.animTimer <= 0) { state.anim = 'idle'; el.style.transform = ''; }
    }

    // Sleeping
    if (state.anim === 'sleep') {
      el.style.transform = 'scale(0.9)';
      zzzEl.style.left = (state.x + 40) + 'px';
      zzzEl.style.top = (state.y - 10) + 'px';
      zzzEl.classList.add('show');
    } else {
      zzzEl.classList.remove('show');
    }

    el.style.left = state.x + 'px';
    el.style.top = state.y + 'px';

    // Bubble follows
    if (state.messageTimer > 0) {
      state.messageTimer--;
      if (state.messageTimer === 0) bubble.classList.remove('show');
      bubble.style.left = (state.x + 30) + 'px';
      bubble.style.top = (state.y - 40) + 'px';
    }
  }

  // ── Random Behavior ──
  function randomBehavior() {
    if (!state.awake) return;
    var r = Math.random();
    if (r < 0.3) startWalk();
    else if (r < 0.42) startJump();
    else if (r < 0.48) startSleep();
  }

  function startWalk() {
    state.anim = 'walk';
    if (Math.random() > 0.6) state.dir *= -1;
    var t = 1500 + Math.random() * 3000;
    setTimeout(function(){ if (state.anim === 'walk') { state.anim = 'idle'; el.style.transform = ''; } }, t);
  }

  function startJump() {
    state.anim = 'jump'; state.animTimer = 25;
    setTimeout(function(){ if (state.anim === 'jump') { state.anim = 'idle'; el.style.transform = ''; } }, 1500);
  }

  function startSleep() {
    state.awake = false; state.anim = 'sleep';
    say('Zzz...');
    setTimeout(function() {
      state.awake = true; state.anim = 'idle'; el.style.transform = '';
      state.stats.awakeMinutes++;
    }, 8000 + Math.random() * 15000);
  }

  // ── Interaction ──
  function onPetClick(e) {
    e.stopPropagation();
    state.anim = 'happy'; state.animTimer = 18;
    state.stats.petted++;
    var s = CHARACTERS[state.pet].sounds;
    say(s[Math.floor(Math.random() * s.length)]);
  }

  function onPetDblClick(e) {
    e.stopPropagation();
    var snacks = ['🍪','🍩','🍎','🐟','🦴','🥕','🍓','🧁'];
    say(snacks[Math.floor(Math.random() * snacks.length)] + ' Yum!');
    state.anim = 'happy'; state.animTimer = 30;
  }

  function say(msg) {
    bubble.textContent = msg;
    bubble.classList.add('show');
    bubble.style.left = (state.x + 30) + 'px';
    bubble.style.top = (state.y - 40) + 'px';
    state.messageTimer = 50;
  }

  function saveProgress() {
    chrome.storage && chrome.storage.local.set({ stats: state.stats, pet: state.pet });
  }

  // ── Popup Messages ──
  chrome.runtime && chrome.runtime.onMessage.addListener(function(msg) {
    if (msg.action === 'changePet' && CHARACTERS[msg.pet]) {
      state.pet = msg.pet; updatePetSVG(); saveProgress();
    }
  });
})();
