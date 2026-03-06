function drawChart(chartData) {
  let data = google.visualization.arrayToDataTable([
    ['Task', 'Cucumber Results'],
    ['Passed', chartData.passed],
    ['Failed', chartData.failed],
    ['Pending', chartData.pending],
    ['Undefined', chartData.notdefined],
    ['Ambiguous', chartData.ambiguous],
    ['Skipped', chartData.skipped],
    ['Re-run', chartData.rerun],
  ]);

  let total =
    chartData.passed + chartData.failed + (chartData.pending || 0) + (chartData.notdefined || 0) + (chartData.ambiguous || 0) + (chartData.skipped || 0) || chartData.rerun || 0;
  let title;

  if (total === 1) {
    title = total + ' ' + chartData.title.slice(0, -1);
  } else {
    title = total + ' ' + chartData.title;
  }

  let options = {
    width: '100%',
    height: 240,
    title: title,
    is3D: true,
    colors: ['#16a34a', '#dc2626', '#64748b', '#0891b2', '#0284c7', '#d97706', '#ea580c'],
    fontSize: '13',
    fontName: '"DM Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
    slices: {
      1: { offset: 0.4 },
      2: { offset: 0.4 },
      3: { offset: 0.4 },
      4: { offset: 0.4 },
      5: { offset: 0.4 },
      6: { offset: 0.4 },
      7: { offset: 0.4 },
    },
    titleTextStyle: {
      fontSize: '13',
      color: '#5e5e5e',
    },
  };

  let chart = new google.visualization.PieChart(document.getElementById('piechart_' + chartData.title.toLowerCase()));

  chart.draw(data, options);
}
