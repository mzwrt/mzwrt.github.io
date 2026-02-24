/* ===================================================
   AUTH — SHA-256 password gate (Web Crypto API)
   To change the password, run in browser console:
     sha256('yourNewPassword').then(h => console.log(h))
   then replace PASSWORD_HASH below with the output.
=================================================== */
const AUTH_SESSION_KEY = 'helpdocs_auth';
// Default password: admin123
const PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

async function sha256(str) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function isAuthenticated() {
  return sessionStorage.getItem(AUTH_SESSION_KEY) === 'ok';
}

async function attemptLogin() {
  const input = document.getElementById('loginPassword');
  const errorEl = document.getElementById('loginError');
  const pwd = input.value;
  if (!pwd) { errorEl.textContent = '请输入密码'; return; }
  const hash = await sha256(pwd);
  if (hash === PASSWORD_HASH) {
    sessionStorage.setItem(AUTH_SESSION_KEY, 'ok');
    document.getElementById('loginOverlay').style.display = 'none';
    render();
  } else {
    errorEl.textContent = '密码错误，请重试';
    input.value = '';
    input.focus();
  }
}

function logout() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  location.reload();
}

/* ===================================================
   DATA LAYER — localStorage persistence
=================================================== */
const STORE_KEY = 'helpdocs_v2';

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : getDefaultData();
  } catch { return getDefaultData(); }
}

function saveData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function getDefaultData() {
  return {
    categories: ['快速入门', '常见问题', '操作指南', '其他'],
    docs: [
      {
        id: uid(),
        title: '欢迎使用帮助文档',
        category: '快速入门',
        content: '这是你的个人帮助文档中心。\n\n你可以：\n• 点击右上角「新建文档」添加文档\n• 点击左侧分类筛选文档\n• 点击文档卡片查看详情\n• 悬停卡片使用编辑 / 删除按钮\n• 使用顶部搜索框快速定位内容\n\n所有数据存储在浏览器本地，无需服务器。',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

let appData = loadData();
let currentCategory = 'ALL';
let searchQuery = '';
let editingId = null;

/* ===================================================
   RENDER
=================================================== */
function render() {
  renderCategories();
  renderDocs();
  renderStats();
}

function renderCategories() {
  const list = document.getElementById('categoryList');
  const cats = appData.categories;
  const countAll = appData.docs.length;

  const allItem = document.createElement('div');
  allItem.className = 'cat-item' + (currentCategory === 'ALL' ? ' active' : '');
  allItem.dataset.cat = 'ALL';
  allItem.innerHTML = `<span class="cat-name">📄 全部文档</span><span class="cat-count">${countAll}</span>`;

  list.innerHTML = '';
  list.appendChild(allItem);

  cats.forEach(cat => {
    const count = appData.docs.filter(d => d.category === cat).length;
    const item = document.createElement('div');
    item.className = 'cat-item' + (currentCategory === cat ? ' active' : '');
    item.dataset.cat = cat;
    item.innerHTML = `<span class="cat-name">🗂 ${escHtml(cat)}</span><span class="cat-count">${count}</span>`;
    list.appendChild(item);
  });

  list.onclick = e => {
    const item = e.target.closest('.cat-item');
    if (item) selectCategory(item.dataset.cat);
  };

  document.getElementById('currentCatName').textContent =
    currentCategory === 'ALL' ? '' : `· ${currentCategory}`;
}

function renderDocs() {
  let filtered = appData.docs;
  if (currentCategory !== 'ALL') filtered = filtered.filter(d => d.category === currentCategory);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d =>
      d.title.toLowerCase().includes(q) ||
      d.content.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    );
  }

  const grid = document.getElementById('docsGrid');
  const empty = document.getElementById('emptyState');
  const badge = document.getElementById('sectionBadge');
  const title = document.getElementById('sectionTitle');

  badge.textContent = filtered.length;
  title.textContent = currentCategory === 'ALL' ? '所有文档' : currentCategory;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  grid.innerHTML = '';
  filtered.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'doc-card';
    card.dataset.id = doc.id;
    card.innerHTML = `
      <div class="doc-card-header">
        <div class="doc-card-title">${escHtml(doc.title)}</div>
        <div class="doc-card-actions">
          <button class="icon-btn edit" data-action="edit" data-id="${escHtml(doc.id)}" title="编辑">✏️</button>
          <button class="icon-btn delete" data-action="delete" data-id="${escHtml(doc.id)}" title="删除">🗑</button>
        </div>
      </div>
      <div class="doc-card-tag">🗂 ${escHtml(doc.category)}</div>
      <div class="doc-card-body">${escHtml(doc.content)}</div>
      <div class="doc-card-footer">
        <div class="doc-card-date">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${formatDate(doc.createdAt)}
        </div>
        ${doc.updatedAt !== doc.createdAt ? '<span>已编辑</span>' : ''}
      </div>`;
    grid.appendChild(card);
  });

  grid.onclick = e => {
    const btn = e.target.closest('[data-action]');
    if (btn) {
      e.stopPropagation();
      if (btn.dataset.action === 'edit') openEditModal(btn.dataset.id);
      else if (btn.dataset.action === 'delete') confirmDelete(btn.dataset.id);
      return;
    }
    const card = e.target.closest('.doc-card');
    if (card) openDetail(card.dataset.id);
  };
}

function renderStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthCount = appData.docs.filter(d => new Date(d.createdAt) >= monthStart).length;
  document.getElementById('statTotal').textContent = appData.docs.length;
  document.getElementById('statCats').textContent = appData.categories.length;
  document.getElementById('statMonth').textContent = monthCount;
}

/* ===================================================
   CATEGORY ACTIONS
=================================================== */
function selectCategory(cat) {
  currentCategory = cat;
  searchQuery = '';
  document.getElementById('searchInput').value = '';
  render();
  if (window.innerWidth <= 768) closeSidebar();
}

function openAddCategory() {
  document.getElementById('catName').value = '';
  openModal('catModal');
  setTimeout(() => document.getElementById('catName').focus(), 100);
}

function saveCategory() {
  const name = document.getElementById('catName').value.trim();
  if (!name) { showToast('请输入分类名称', 'error'); return; }
  if (appData.categories.includes(name)) {
    showToast('该分类已存在', 'error'); return;
  }
  appData.categories.push(name);
  saveData(appData);
  closeModal('catModal');
  render();
  showToast(`分类「${name}」已创建`, 'success');
}

/* ===================================================
   DOC MODAL — Add / Edit
=================================================== */
function openAddModal() {
  editingId = null;
  document.getElementById('modalTitle').textContent = '新建文档';
  document.getElementById('docTitle').value = '';
  document.getElementById('docContent').value = '';
  populateCategorySelect();
  openModal('docModal');
  setTimeout(() => document.getElementById('docTitle').focus(), 100);
}

function openEditModal(id) {
  const doc = appData.docs.find(d => d.id === id);
  if (!doc) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = '编辑文档';
  document.getElementById('docTitle').value = doc.title;
  document.getElementById('docContent').value = doc.content;
  populateCategorySelect(doc.category);
  openModal('docModal');
  setTimeout(() => document.getElementById('docTitle').focus(), 100);
}

function populateCategorySelect(selected) {
  const sel = document.getElementById('docCategory');
  sel.innerHTML = '';
  appData.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === selected) opt.selected = true;
    sel.appendChild(opt);
  });
}

function saveDoc() {
  const title   = document.getElementById('docTitle').value.trim();
  const cat     = document.getElementById('docCategory').value;
  const content = document.getElementById('docContent').value.trim();

  if (!title)   { showToast('请输入标题', 'error'); return; }
  if (!content) { showToast('请输入内容', 'error'); return; }

  if (editingId) {
    const doc = appData.docs.find(d => d.id === editingId);
    if (doc) {
      doc.title = title;
      doc.category = cat;
      doc.content = content;
      doc.updatedAt = new Date().toISOString();
    }
    showToast('文档已更新', 'success');
  } else {
    appData.docs.push({
      id: uid(), title, category: cat, content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    showToast('文档已创建', 'success');
  }
  saveData(appData);
  closeModal('docModal');
  render();
}

/* ===================================================
   DETAIL MODAL
=================================================== */
function openDetail(id) {
  const doc = appData.docs.find(d => d.id === id);
  if (!doc) return;
  document.getElementById('detailTitle').textContent = doc.title;
  document.getElementById('detailTag').textContent = '🗂 ' + doc.category;
  document.getElementById('detailContent').textContent = doc.content;
  document.getElementById('detailMeta').innerHTML =
    `<span>📅 创建：${formatDate(doc.createdAt)}</span>` +
    (doc.updatedAt !== doc.createdAt ? `<span>✏️ 更新：${formatDate(doc.updatedAt)}</span>` : '');
  document.getElementById('detailEditBtn').onclick = () => {
    closeModal('detailModal');
    openEditModal(id);
  };
  openModal('detailModal');
}

/* ===================================================
   DELETE
=================================================== */
function confirmDelete(id) {
  const doc = appData.docs.find(d => d.id === id);
  if (!doc) return;
  document.getElementById('confirmText').textContent = `确定要删除「${doc.title}」吗？此操作不可撤销。`;
  document.getElementById('confirmOkBtn').onclick = () => deleteDoc(id);
  openModal('confirmModal');
}

function deleteDoc(id) {
  appData.docs = appData.docs.filter(d => d.id !== id);
  saveData(appData);
  closeModal('confirmModal');
  render();
  showToast('文档已删除', 'info');
}

/* ===================================================
   SEARCH
=================================================== */
function handleSearch(val) {
  searchQuery = val.trim();
  if (searchQuery) currentCategory = 'ALL';
  render();
}

/* ===================================================
   EXPORT
=================================================== */
function exportDocs() {
  const dataStr = JSON.stringify(appData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `helpdocs_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('已导出为 JSON 文件', 'success');
}

/* ===================================================
   MODAL HELPERS
=================================================== */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* ===================================================
   SIDEBAR (MOBILE)
=================================================== */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

/* ===================================================
   TOAST
=================================================== */
const TOAST_DISPLAY_DURATION = 2800;
const TOAST_FADE_DURATION = 300;

function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const iconSpan = document.createElement('span');
  iconSpan.textContent = icons[type] || 'ℹ️';
  const msgSpan = document.createElement('span');
  msgSpan.textContent = msg;
  el.appendChild(iconSpan);
  el.appendChild(msgSpan);
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = `opacity ${TOAST_FADE_DURATION}ms`;
  }, TOAST_DISPLAY_DURATION);
  setTimeout(() => el.remove(), TOAST_DISPLAY_DURATION + TOAST_FADE_DURATION);
}

/* ===================================================
   UTILS
=================================================== */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/* ===================================================
   EVENT WIRING (DOMContentLoaded)
=================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Login
  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    attemptLogin();
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Sidebar toggle (mobile)
  document.getElementById('hamburgerBtn').addEventListener('click', toggleSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  // Top actions
  document.getElementById('exportBtn').addEventListener('click', exportDocs);
  document.getElementById('addDocBtn').addEventListener('click', openAddModal);
  document.getElementById('addCatBtn').addEventListener('click', openAddCategory);

  // Modal save buttons
  document.getElementById('saveDocBtn').addEventListener('click', saveDoc);
  document.getElementById('saveCatBtn').addEventListener('click', saveCategory);

  // Search
  document.getElementById('searchInput').addEventListener('input', e => handleSearch(e.target.value));

  // [data-close-modal] buttons — close the named modal
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-close-modal]');
    if (btn) closeModal(btn.dataset.closeModal);
  });

  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target === el) el.classList.remove('open');
    });
  });

  // ESC closes open modals; Enter submits cat modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(el => el.classList.remove('open'));
    }
    if (e.key === 'Enter' && document.getElementById('catModal').classList.contains('open')) {
      saveCategory();
    }
  });

  // Init
  if (isAuthenticated()) {
    document.getElementById('loginOverlay').style.display = 'none';
    render();
  } else {
    document.getElementById('loginOverlay').style.display = 'flex';
    setTimeout(() => document.getElementById('loginPassword').focus(), 100);
  }
});
