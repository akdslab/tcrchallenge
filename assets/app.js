/* Progressive enhancement only: every article and source link is server-rendered. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const menu = $('.menu-button');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menu.textContent = open ? 'Close −' : 'Menu +';
  $('#main-nav').classList.toggle('open', open);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.click(); menu.focus();
  }
});
async function copyText(text, button) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied ✓';
    button.setAttribute('aria-label', 'Copied to clipboard');
  } catch {
    button.textContent = 'Select text to copy';
  }
  setTimeout(() => { button.textContent = original; button.removeAttribute('aria-label'); }, 2500);
}
$$('.copy').forEach(button => button.addEventListener('click', () => {
  const target = button.dataset.copyTarget ? $(button.dataset.copyTarget) : $('code', button.closest('.code-block'));
  if (target) copyText(target.textContent, button);
}));

const diagramCopy = {
  tcr: ['T-cell receptor', 'A receptor on the T cell recognizes the peptide together with the MHC molecule that holds it. This guide focuses on alpha–beta T-cell receptors.'],
  peptide: ['Peptide', 'A peptide is a short chain of amino acids. Cells display peptides from proteins; the same receptor may recognize more than one peptide.'],
  mhc: ['MHC / HLA', 'An MHC molecule holds a peptide at the cell surface. Human MHC molecules are called HLA. Both the peptide and its HLA context matter for recognition.']
};
$$('[data-diagram]').forEach(button => button.addEventListener('click', () => {
  $$('[data-diagram]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  const [title, copy] = diagramCopy[button.dataset.diagram];
  const target = $('#diagram-description');
  target.replaceChildren(Object.assign(document.createElement('strong'), {textContent:title}), document.createTextNode(' ' + copy));
}));

const glossarySearch = $('#glossary-search');
glossarySearch?.addEventListener('input', () => {
  const query = glossarySearch.value.toLowerCase().trim();
  let count = 0;
  $$('.glossary-item').forEach(item => { item.hidden = !item.textContent.toLowerCase().includes(query); if (!item.hidden) count++; });
  $('#glossary-status').textContent = count ? `${count} terms shown` : 'No matching terms. Try “peptide”, “score”, or “HLA”.';
});

$$('[data-filter-group]').forEach(group => {
  const target = group.dataset.filterGroup;
  $$('[data-filter]', group).forEach(button => button.addEventListener('click', () => {
    $$('[data-filter]', group).forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    $$(`[data-filter-item="${target}"]`).forEach(item => {
      item.hidden = button.dataset.filter !== 'all' && !item.dataset.tags.split(' ').includes(button.dataset.filter);
    });
  }));
});

const benchmarkButtons = $$('[data-benchmark]');
function chooseBenchmark(button) {
  benchmarkButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  $$('[data-benchmark-panel]').forEach(panel => { panel.hidden = panel.dataset.benchmarkPanel !== button.dataset.benchmark; });
}
benchmarkButtons.forEach(button => button.addEventListener('click', () => chooseBenchmark(button)));
if (benchmarkButtons.length) chooseBenchmark(benchmarkButtons[0]);

const hardware = $('#hardware');
function setHardware() {
  const cpu = hardware.value === 'cpu';
  $$('[data-hardware]').forEach(block => { block.hidden = block.dataset.hardware !== hardware.value; });
  $('#hardware-description').textContent = cpu ? 'Uses the 300M sequence checkpoint and device="cpu". No GPU required. Running a model still needs local installation and a weights download.' : 'Uses the default 600M sequence checkpoint and device="cuda:0". The repository describes this model as running on common GPUs (≤24 GB). Check available memory for your workload.';
}
hardware?.addEventListener('change', setHardware);
if (hardware) setHardware();

const form = $('#community-form');
if (form) {
  $('button[type="submit"]', form).disabled = false;
  const params = new URLSearchParams(window.location.search);
  for (const name of ['kind', 'model']) {
    const field = $(`[name="${name}"]`, form);
    const value = params.get(name);
    if (value && [...field.options].some(option => option.value === value)) field.value = value;
  }
}
form?.addEventListener('submit', event => {
  event.preventDefault();
  for (const name of ['title', 'description']) {
    const field = $(`[name="${name}"]`, form);
    field.setCustomValidity(field.value.trim() ? '' : 'Please add a few words.');
    field.addEventListener('input', () => field.setCustomValidity(''), {once:true});
  }
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  const title = `[${values.kind}] ${values.title.trim()}`;
  const body = `## ${values.kind}\n\n${values.description.trim()}\n\n## Context\n\n- Model or resource: ${values.model}\n- Evidence or source: ${values.evidence.trim() || 'Not supplied'}\n\n## What would help\n\n${values.request.trim() || 'Discussion and suggestions from the community.'}\n\nPrepared using the TCR Challenge feedback builder.`;
  $('#draft-title').textContent = title;
  $('#draft-body').textContent = body;
  const base = form.dataset.issuesUrl + '/new';
  const url = new URL(base);
  url.searchParams.set('title', title);
  url.searchParams.set('body', body);
  const post = $('#open-github');
  post.href = url.toString();
  post.hidden = url.toString().length > 7500;
  $('#draft-status').textContent = post.hidden ? 'Your draft is ready. This draft is long; copy it into a new GitHub issue using the link below.' : 'Your draft is ready. Nothing has been sent. Review it, then open GitHub to post.';
  $('#draft-result').hidden = false;
  $('#draft-result').focus({preventScroll:true});
  $('#draft-result').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
});

const promptButtons = $$('[data-agent]');
promptButtons.forEach(button => button.addEventListener('click', () => {
  promptButtons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  $$('[data-agent-panel]').forEach(panel => { panel.hidden = panel.dataset.agentPanel !== button.dataset.agent; });
}));
if (promptButtons.length) promptButtons[0].click();
