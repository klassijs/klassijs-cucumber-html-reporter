var DONUT_COLORS = ['#16a34a', '#dc2626', '#64748b', '#0891b2', '#0284c7', '#d97706', '#ea580c'];

function buildDataTable(chartData) {
  return google.visualization.arrayToDataTable([
    ['Status', 'Count'],
    ['Passed', chartData.passed || 0],
    ['Failed', chartData.failed || 0],
    ['Pending', chartData.pending || 0],
    ['Undefined', chartData.notdefined || 0],
    ['Ambiguous', chartData.ambiguous || 0],
    ['Skipped', chartData.skipped || 0],
    ['Re-run', chartData.rerun || 0],
  ]);
}

function drawCombinedDonut(featuresData, scenariosData) {
  var innerEl = document.getElementById('donut-inner');
  var outerEl = document.getElementById('donut-outer');
  if (!innerEl || !outerEl) return;

  var featuresTable = buildDataTable(featuresData);
  var scenariosTable = buildDataTable(scenariosData);

  var outerOptions = {
    width: '100%',
    height: 320,
    pieHole: 0.55,
    colors: DONUT_COLORS,
    fontSize: 12,
    fontName: '"DM Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    legend: 'none',
    chartArea: { width: '100%', height: '85%' },
    tooltip: { trigger: 'focus' },
  };

  var innerOptions = {
    width: '100%',
    height: '100%',
    pieHole: 0.35,
    colors: DONUT_COLORS,
    fontSize: 11,
    fontName: '"DM Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    legend: 'none',
    chartArea: { width: '100%', height: '100%' },
    tooltip: { trigger: 'focus' },
  };

  var outerChart = new google.visualization.PieChart(outerEl);
  var innerChart = new google.visualization.PieChart(innerEl);

  outerChart.draw(scenariosTable, outerOptions);
  innerChart.draw(featuresTable, innerOptions);
}

function drawChart(chartData) {
  var data = buildDataTable(chartData);

  var total =
    (chartData.passed || 0) + (chartData.failed || 0) + (chartData.pending || 0) + (chartData.notdefined || 0) +
    (chartData.ambiguous || 0) + (chartData.skipped || 0) + (chartData.rerun || 0);
  var title = total === 1 ? total + ' ' + chartData.title.slice(0, -1) : total + ' ' + chartData.title;

  var options = {
    width: '100%',
    height: 240,
    title: title,
    is3D: true,
    colors: DONUT_COLORS,
    fontSize: '13',
    fontName: '"DM Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    slices: { 1: { offset: 0.4 }, 2: { offset: 0.4 }, 3: { offset: 0.4 }, 4: { offset: 0.4 }, 5: { offset: 0.4 }, 6: { offset: 0.4 }, 7: { offset: 0.4 } },
    titleTextStyle: { fontSize: '13', color: '#5e5e5e' },
  };

  var chart = new google.visualization.PieChart(document.getElementById('piechart_' + chartData.title.toLowerCase()));
  chart.draw(data, options);
}
