(function () {
  const searchInput = document.getElementById('report-search');
  const chips = Array.from(document.querySelectorAll('[data-filter]'));
  const features = Array.from(document.querySelectorAll('[data-feature]'));
  const expandAll = document.querySelector('[data-expand-all]');
  const generated = document.querySelector('.generated-on');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox ? lightbox.querySelector('img') : null;
  const jump = document.getElementById('feature-jump');
  const jumpMore = document.querySelector('[data-jump-more]');
  const emptyFilter = document.querySelector('[data-empty-filter]');
  const JUMP_LIMIT = 12;
  let jumpExpanded = false;

  if (jump) {
    features.forEach((feature) => {
      const link = document.createElement('a');
      link.href = '#' + feature.id;
      link.textContent = feature.getAttribute('data-title') || feature.id;
      link.setAttribute('data-status', feature.getAttribute('data-status') || 'passed');
      link.setAttribute('data-jump-for', feature.id);
      jump.appendChild(link);
    });
  }

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

  function currentFilter() {
    const active = chips.find((chip) => chip.getAttribute('aria-pressed') === 'true');
    return active ? active.getAttribute('data-filter') : 'all';
  }

  function applyFilters() {
    const query = (searchInput && searchInput.value ? searchInput.value : '').trim().toLowerCase();
    const status = currentFilter();

    features.forEach((feature) => {
      const scenarios = Array.from(feature.querySelectorAll('[data-scenario]'));
      let visibleScenarios = 0;

      scenarios.forEach((scenario) => {
        const matchesStatus = status === 'all' || scenario.getAttribute('data-status') === status;
        const matchesQuery = !query || (scenario.getAttribute('data-search') || '').includes(query);
        const show = matchesStatus && matchesQuery;
        scenario.classList.toggle('is-hidden', !show);
        if (show) visibleScenarios += 1;
      });

      const featureMatches =
        visibleScenarios > 0 ||
        ((status === 'all' || feature.getAttribute('data-status') === status) &&
          (!query || (feature.getAttribute('data-search') || '').includes(query)));

      feature.classList.toggle('is-hidden', !featureMatches);
      if (featureMatches && (query || status !== 'all')) {
        feature.open = true;
      }

      const jumpLink = jump ? jump.querySelector('[data-jump-for="' + feature.id + '"]') : null;
      if (jumpLink) {
        jumpLink.setAttribute('data-jump-match', featureMatches ? 'true' : 'false');
      }
    });

    updateJumpList(status, query);

    const visibleCount = features.filter((feature) => !feature.classList.contains('is-hidden')).length;
    if (emptyFilter) {
      emptyFilter.classList.toggle('is-hidden', visibleCount > 0);
    }
  }

  function updateJumpList(status, query) {
    if (!jump) return;
    const links = Array.from(jump.querySelectorAll('[data-jump-for]'));
    const matching = links.filter((link) => link.getAttribute('data-jump-match') === 'true');
    const capList = status === 'all' && !query && !jumpExpanded;
    let shown = 0;

    links.forEach((link) => {
      const matches = link.getAttribute('data-jump-match') === 'true';
      const overCap = capList && matches && shown >= JUMP_LIMIT;
      if (matches && !overCap) {
        shown += 1;
      }
      link.classList.toggle('is-hidden', !matches || overCap);
    });

    if (jumpMore) {
      const extra = matching.length - JUMP_LIMIT;
      const showToggle = status === 'all' && !query && extra > 0;
      jumpMore.hidden = !showToggle;
      jumpMore.textContent = jumpExpanded ? 'Show less' : 'Show all (' + extra + ' more)';
    }
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', function () {
      chips.forEach((item) => item.setAttribute('aria-pressed', String(item === chip)));
      jumpExpanded = false;
      applyFilters();
    });
  });

  if (jumpMore) {
    jumpMore.addEventListener('click', function () {
      jumpExpanded = !jumpExpanded;
      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (expandAll) {
    expandAll.addEventListener('click', function () {
      const shouldOpen = expandAll.textContent === 'Expand all';
      document.querySelectorAll('[data-feature], [data-scenario]').forEach((node) => {
        if (!node.classList.contains('is-hidden')) {
          node.open = shouldOpen;
        }
      });
      expandAll.textContent = shouldOpen ? 'Collapse all' : 'Expand all';
    });
  }

  document.addEventListener('click', function (event) {
    const image = event.target.closest('img.screenshot');
    if (!image || !lightbox || !lightboxImage) return;
    event.preventDefault();
    lightboxImage.src = image.getAttribute('src');
    lightbox.showModal();
  });

  applyFilters();
})();
