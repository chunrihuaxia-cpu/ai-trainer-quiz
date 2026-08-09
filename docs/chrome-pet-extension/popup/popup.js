// Screen Buddy Popup — Pet Selection
var PETS = {
  cat:  { name:'猫咪', free:true, emoji:'🐱' },
  dog:  { name:'小狗', free:true, emoji:'🐶' },
  frog: { name:'青蛙', free:true, emoji:'🐸' },
  panda:{ name:'熊猫', premium:true, emoji:'🐼' },
  bunny:{ name:'兔子', premium:true, emoji:'🐰' },
  fox:  { name:'狐狸', premium:true, emoji:'🦊' },
  owl:  { name:'猫头鹰', premium:true, emoji:'🦉' },
  unicorn:{name:'独角兽', premium:true, emoji:'🦄' },
  dragon:{name:'小龙', premium:true, emoji:'🐲' },
};

var currentPet = 'cat';
var isPremium = false;

// Render pet grid with emoji preview
var grid = document.getElementById('petGrid');
Object.keys(PETS).forEach(function(key) {
  var p = PETS[key];
  var card = document.createElement('div');
  card.className = 'pet-card';
  card.id = 'card_' + key;
  card.innerHTML = '<span class="pet-emoji">' + p.emoji + '</span><span class="pet-name">' + p.name + (p.premium ? ' 🔒' : '') + '</span>';
  card.onclick = function() {
    if (p.premium && !isPremium) { alert('Pro 版宠物！$2.99/月解锁更多～'); return; }
    selectPet(key);
  };
  grid.appendChild(card);
});

function selectPet(key) {
  currentPet = key;
  document.querySelectorAll('.pet-card').forEach(function(c){ c.classList.remove('active'); });
  document.getElementById('card_' + key).classList.add('active');
  chrome.tabs.query({active:true,currentWindow:true}, function(tabs) {
    if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, {action:'changePet', pet:key});
  });
}

// Load state
chrome.storage.local.get(['pet','stats','premium'], function(data) {
  if (data && data.pet) currentPet = data.pet;
  if (data && data.premium) isPremium = data.premium;
  updateStats(data && data.stats);
  var card = document.getElementById('card_' + currentPet);
  if (card) card.classList.add('active');
});

function updateStats(stats) {
  if (!stats) return;
  document.getElementById('stats').innerHTML =
    '🐾 步数: <b>' + (stats.steps || 0) + '</b> | ' +
    '✋ 抚摸: <b>' + (stats.petted || 0) + '</b><br>' +
    '⏰ 唤醒: <b>' + (stats.awakeMinutes || 0) + '</b> 分钟';
}

document.getElementById('feedBtn').onclick = function() {
  alert('已喂食！🍪');
};
document.getElementById('premiumLink').onclick = function(e) {
  e.preventDefault();
  alert('Pro 版即将上线！$2.99/月解锁全部宠物');
};
document.getElementById('resetBtn').onclick = function() {
  chrome.tabs.query({active:true,currentWindow:true}, function(tabs) {
    if (tabs[0]) chrome.tabs.reload(tabs[0].id);
  });
};
