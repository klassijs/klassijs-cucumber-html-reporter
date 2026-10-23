(function () {
  const searchInput = document.getElementById('report-search');
  const panels = Array.from(document.querySelectorAll('[data-feature]'));
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const treemap = document.querySelector('[data-treemap]');
  const generated = document.querySelector('.generated-on');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox ? lightbox.querySelector('img') : null;
  const emptyFilter = document.querySelector('[data-empty-filter]');
  const dataNode = document.getElementById('mosaic-data');
  const chartData = dataNode ? JSON.parse(dataNode.textContent) : { features: [] };
  let tiles = [];
  let activeFilter = 'all';
  let tapeMode = 'scenarios';

  function relativeTime(date) {
    const diff = Date.now() - date.getTime();
    const minutes = Math.round(diff / 60000);
    if (Math.abs(minutes) < 1) return 'just now';
    if (Math.abs(minutes) < 60) return minutes + ' minutes ago';
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return hours + ' hours ago';
    const days = Math.round(hours / 24);
    return days + ' days ago';
  }

  if (generated) {
    const stamped = new Date(generated.textContent);
    if (!Number.isNaN(stamped.getTime())) {
      generated.title = stamped.toISOString();
      generated.textContent = 'Report generated ' + relativeTime(stamped);
    }
  }

  function query() {
    return searchInput ? searchInput.value.trim().toLowerCase() : '';
  }

  function matches(el) {
    const status = el.getAttribute('data-status');
    const matchesFilter = activeFilter === 'all' || status === activeFilter;
    const matchesSearch = !query() || (el.getAttribute('data-search') || '').includes(query());
    return matchesFilter && matchesSearch;
  }

  function controls() {
    return Array.from(document.querySelectorAll('[data-open]'));
  }

  function markCurrent(id) {
    controls().forEach((node) => {
      if (node.getAttribute('data-open') === id) {
        node.setAttribute('aria-current', 'true');
      } else {
        node.removeAttribute('aria-current');
      }
    });
  }

  function showFeature(id) {
    markCurrent(id);
    panels.forEach((panel) => {
      panel.hidden = panel.id !== id;
    });
  }

  function setTape(mode) {
    tapeMode = mode === 'steps' ? 'steps' : 'scenarios';
    document.querySelectorAll('[data-ring]').forEach((ring) => {
      ring.classList.toggle('is-active', ring.getAttribute('data-ring') === tapeMode);
    });
    document.querySelectorAll('.kpi[data-ring-hit]').forEach((kpi) => {
      kpi.setAttribute('aria-pressed', String(kpi.getAttribute('data-ring-hit') === tapeMode));
    });
    document.querySelectorAll('[data-genome]').forEach((tape) => {
      tape.classList.toggle('is-hidden', tape.getAttribute('data-genome') !== tapeMode);
    });
    document.querySelectorAll('[data-mix]').forEach((mix) => {
      mix.classList.toggle('is-hidden', mix.getAttribute('data-mix') !== tapeMode);
    });
    document.querySelectorAll('[data-legend]').forEach((legend) => {
      legend.classList.toggle('is-hidden', legend.getAttribute('data-legend') !== tapeMode);
    });
    const title = document.querySelector('[data-genome-title]');
    if (title) {
      title.textContent = title.getAttribute(tapeMode === 'steps' ? 'data-title-steps' : 'data-title-scenarios') || title.textContent;
    }
    const copy = document.querySelector('[data-ring-copy]');
    if (copy) {
      copy.textContent = copy.getAttribute(tapeMode === 'steps' ? 'data-copy-steps' : 'data-copy-scenarios') || copy.textContent;
    }
    applyVisibility();
  }

  function applyVisibility() {
    let firstMatch = null;
    document.querySelectorAll('[data-genome="' + tapeMode + '"] .gene, .bar-row').forEach((node) => {
      const visible = matches(node);
      node.classList.toggle('is-hidden', !visible);
      if (visible && !firstMatch) firstMatch = node;
    });
    renderTreemap();
    if (!firstMatch && tiles[0]) firstMatch = tiles[0];
    if (emptyFilter) {
      emptyFilter.classList.toggle('is-hidden', Boolean(firstMatch));
    }
    if (firstMatch) {
      const selected = controls().find((node) => node.getAttribute('aria-current') === 'true' && matches(node));
      if (!selected) {
        showFeature(firstMatch.getAttribute('data-open'));
      }
    }
  }

  function sum(nodes) {
    return nodes.reduce((total, node) => total + node.value, 0);
  }

  function split(nodes, x, y, width, height) {
    if (!nodes.length) return;
    if (nodes.length === 1) {
      nodes[0].x = x;
      nodes[0].y = y;
      nodes[0].w = width;
      nodes[0].h = height;
      return;
    }
    const total = sum(nodes);
    let acc = 0;
    let index = 0;
    while (index < nodes.length - 1 && acc + nodes[index].value < total / 2) {
      acc += nodes[index].value;
      index += 1;
    }
    const left = nodes.slice(0, index + 1);
    const right = nodes.slice(index + 1);
    if (!right.length) {
      split(left, x, y, width, height);
      return;
    }
    if (width >= height) {
      const leftWidth = width * (sum(left) / total);
      split(left, x, y, leftWidth, height);
      split(right, x + leftWidth, y, width - leftWidth, height);
    } else {
      const leftHeight = height * (sum(left) / total);
      split(left, x, y, width, leftHeight);
      split(right, x, y + leftHeight, width, height - leftHeight);
    }
  }

  function renderTreemap() {
    if (!treemap) return;
    const gap = 3;
    const width = treemap.clientWidth || 640;
    const height = treemap.clientHeight || 380;
    const visible = chartData.features.filter((feature) => {
      const matchesFilter = activeFilter === 'all' || feature.status === activeFilter;
      const matchesSearch = !query() || (feature.search || '').includes(query());
      return matchesFilter && matchesSearch;
    });
    const nodes = visible.map((feature) => ({
      ...feature,
      value: Math.max(1, Number(feature.scenarios) || 1) * 4 + Math.max(0, Math.round((Number(feature.time) || 0) / 10000000)),
    })).sort((a, b) => b.value - a.value);
    split(nodes, 0, 0, width, height);
    treemap.innerHTML = '';
    nodes.forEach((node) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tile ' + node.status;
      button.setAttribute('data-open', node.id);
      button.setAttribute('data-status', node.status);
      button.setAttribute('data-search', node.search);
      button.style.left = node.x + gap / 2 + 'px';
      button.style.top = node.y + gap / 2 + 'px';
      button.style.width = Math.max(node.w - gap, 0) + 'px';
      button.style.height = Math.max(node.h - gap, 0) + 'px';
      button.title = node.name + ' · ' + node.status;
      if (node.w > 108 && node.h > 56) {
        const status = document.createElement('span');
        status.className = 'tile-status';
        status.textContent = node.status;
        const name = document.createElement('span');
        name.className = 'tile-name';
        name.textContent = node.name;
        const meta = document.createElement('span');
        meta.className = 'tile-meta';
        meta.textContent = node.label;
        button.append(status, name, meta);
      }
      button.addEventListener('click', function () {
        openFromControl(button);
      });
      treemap.appendChild(button);
    });
    tiles = Array.from(treemap.querySelectorAll('[data-open]'));
    const current = document.querySelector('[data-feature]:not([hidden])');
    if (current) {
      markCurrent(current.id);
    }
  }

  function openFromControl(control) {
    showFeature(control.getAttribute('data-open'));
    const stage = document.getElementById('stage');
    if (stage) {
      stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.querySelectorAll('.gene, .bar-row').forEach((node) => {
    node.addEventListener('click', function () {
      openFromControl(node);
    });
  });

  filters.forEach((button) => {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter');
      filters.forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      applyVisibility();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyVisibility);
  }

  document.querySelectorAll('[data-ring-hit]').forEach((hit) => {
    function chooseRing() {
      setTape(hit.getAttribute('data-ring-hit'));
    }
    hit.addEventListener('click', chooseRing);
    hit.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        chooseRing();
      }
    });
  });

  const orbit = document.querySelector('.orbit');
  if (orbit) {
    orbit.addEventListener('mousedown', function (event) {
      event.preventDefault();
    });
    orbit.addEventListener('click', function (event) {
      event.preventDefault();
      if (typeof orbit.blur === 'function') orbit.blur();
      if (document.activeElement && orbit.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      const rect = orbit.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const radius = Math.sqrt(dx * dx + dy * dy) / (rect.width / 140);
      if (radius >= 32 && radius < 48) {
        setTape('steps');
      } else if (radius >= 48 && radius <= 68) {
        setTape('scenarios');
      }
    });
  }

  document.addEventListener('click', function (event) {
    const image = event.target.closest('img.screenshot');
    if (!image || !lightbox || !lightboxImage) return;
    event.preventDefault();
    lightboxImage.src = image.getAttribute('src');
    lightbox.showModal();
  });

  window.addEventListener('resize', function () {
    window.clearTimeout(window.__mosaicResize);
    window.__mosaicResize = window.setTimeout(renderTreemap, 120);
  });

  applyVisibility();
})();
