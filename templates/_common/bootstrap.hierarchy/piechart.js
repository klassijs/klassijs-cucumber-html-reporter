var DONUT_COLORS = ['#16a34a', '#dc2626', '#64748b', '#0891b2', '#0284c7', '#d97706', '#ea580c'];

var STATUS_ORDER = ['Passed', 'Failed', 'Pending', 'Undefined', 'Ambiguous', 'Skipped', 'Re-run'];

function buildDataTable(chartData) {
  var raw = [
    chartData.passed || 0,
    chartData.failed || 0,
    chartData.pending || 0,
    chartData.notdefined || 0,
    chartData.ambiguous || 0,
    chartData.skipped || 0,
    chartData.rerun || 0,
  ];
  var rows = [];
  for (var i = 0; i < STATUS_ORDER.length; i++) {
    if (raw[i] > 0) {
      rows.push([STATUS_ORDER[i], raw[i]]);
    }
  }
  if (rows.length === 0) {
    rows.push(['No data', 1]);
  }
  return google.visualization.arrayToDataTable([['Status', 'Count']].concat(rows));
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
    legend: { position: 'bottom', alignment: 'center' },
    pieSliceText: 'percentage',
    pieSliceTextStyle: { fontSize: 12, color: '#1e293b', bold: true },
    chartArea: { width: '90%', height: '75%' },
    tooltip: { trigger: 'focus', isHtml: false },
  };

  var innerOptions = {
    width: '100%',
    height: '100%',
    pieHole: 0.35,
    colors: DONUT_COLORS,
    fontSize: 11,
    fontName: '"DM Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    legend: 'none',
    pieSliceText: 'percentage',
    pieSliceTextStyle: { fontSize: 11, color: '#1e293b', bold: true },
    chartArea: { width: '100%', height: '100%' },
    tooltip: { trigger: 'focus', isHtml: false },
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
