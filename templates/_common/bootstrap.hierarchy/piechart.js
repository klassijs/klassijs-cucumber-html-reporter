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

function getSlicesColorsForTable(dataTable) {
  var slices = {};
  var rows = dataTable.getNumberOfRows();
  for (var i = 0; i < rows; i++) {
    var statusName = dataTable.getValue(i, 0);
    var colorIndex = STATUS_ORDER.indexOf(statusName);
    if (colorIndex >= 0) {
      slices[i] = { color: DONUT_COLORS[colorIndex] };
    }
  }
  return slices;
}

function drawDonutChart(chartData) {
  var el = document.getElementById('piechart_' + chartData.title.toLowerCase());
  if (!el) return;
  var data = buildDataTable(chartData);
  var options = {
    width: '100%',
    height: 260,
    pieHole: 0.5,
    colors: DONUT_COLORS,
    fontSize: 12,
    fontName: '"DM Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    legend: { position: 'bottom', alignment: 'center' },
    pieSliceText: 'percentage',
    pieSliceTextStyle: { fontSize: 12, color: '#1e293b', bold: true },
    chartArea: { width: '95%', height: '75%', top: 8, bottom: 50 },
    tooltip: { trigger: 'focus' },
    slices: getSlicesColorsForTable(data),
  };
  var chart = new google.visualization.PieChart(el);
  chart.draw(data, options);
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
