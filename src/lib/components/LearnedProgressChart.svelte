<script lang="ts">
  import type { Flashcard } from '$lib/stores/flashcards';
  import {
    buildLearnedProgressSeries,
    formatChartDate,
    progressSeriesColors,
    type ProgressSeriesKey
  } from '$lib/utils/learnedProgress';

  let {
    cards = [],
    startDate,
    endDate = new Date()
  }: {
    cards?: Flashcard[];
    startDate: Date;
    endDate?: Date;
  } = $props();

  const width = 800;
  const height = 300;
  const padding = { top: 24, right: 24, bottom: 44, left: 52 };

  const seriesConfig: { key: ProgressSeriesKey; label: string }[] = [
    { key: 'learned', label: 'Learned' },
    { key: 'mastered', label: 'Mastered' },
    { key: 'bothWays', label: 'Both ways' }
  ];

  let points = $derived(buildLearnedProgressSeries(cards, startDate, endDate));
  let maxCount = $derived.by(() => {
    if (points.length === 0) return 1;
    return Math.max(...points.flatMap((point) => [point.learned, point.mastered, point.bothWays]), 1);
  });
  let chartWidth = width - padding.left - padding.right;
  let chartHeight = height - padding.top - padding.bottom;
  let latest = $derived(points.at(-1) ?? { learned: 0, mastered: 0, bothWays: 0 });

  let yTicks = $derived(
    maxCount <= 4
      ? Array.from({ length: maxCount + 1 }, (_, index) => index)
      : [0, Math.round(maxCount / 2), maxCount]
  );

  let xLabelIndexes = $derived.by(() => {
    if (points.length <= 1) return [0];
    if (points.length === 2) return [0, 1];
    const middle = Math.floor((points.length - 1) / 2);
    return [0, middle, points.length - 1];
  });

  function xPos(index: number): number {
    if (points.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (points.length - 1)) * chartWidth;
  }

  function yPos(count: number): number {
    return padding.top + chartHeight - (count / maxCount) * chartHeight;
  }

  function linePath(key: ProgressSeriesKey): string {
    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xPos(index)} ${yPos(point[key])}`)
      .join(' ');
  }

  function areaPath(key: ProgressSeriesKey): string {
    const line = linePath(key);
    if (!line) return '';
    return `${line} L ${xPos(points.length - 1)} ${padding.top + chartHeight} L ${xPos(0)} ${padding.top + chartHeight} Z`;
  }

  let periodLabel = $derived(`${formatChartDate(startDate)} – ${formatChartDate(endDate)}`);
</script>

<div class="learned-progress-chart">
  <div class="learned-progress-chart__header">
    <div>
      <h2 class="learned-progress-chart__title">Learning progress</h2>
      <p class="learned-progress-chart__desc">
        {latest.learned} learned · {latest.mastered} mastered · {latest.bothWays} both ways · {periodLabel}
      </p>
    </div>
  </div>

  <div class="learned-progress-chart__legend">
    {#each seriesConfig as series (series.key)}
      <span class="learned-progress-chart__legend-item">
        <span
          class="learned-progress-chart__legend-swatch"
          style:background={progressSeriesColors[series.key].line}
        ></span>
        {series.label}
      </span>
    {/each}
  </div>

  <div class="learned-progress-chart__canvas-wrap">
    <svg
      class="learned-progress-chart__svg"
      viewBox="0 0 {width} {height}"
      role="img"
      aria-label="Learning progress from {periodLabel}"
    >
      <defs>
        {#each seriesConfig as series (series.key)}
          <linearGradient id="progress-fill-{series.key}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color={progressSeriesColors[series.key].fillTop} />
            <stop offset="100%" stop-color={progressSeriesColors[series.key].fillBottom} />
          </linearGradient>
        {/each}
      </defs>

      {#each yTicks as tick}
        <line
          class="learned-progress-chart__grid"
          x1={padding.left}
          x2={width - padding.right}
          y1={yPos(tick)}
          y2={yPos(tick)}
        />
        <text class="learned-progress-chart__axis" x={padding.left - 10} y={yPos(tick) + 4} text-anchor="end">
          {tick}
        </text>
      {/each}

      {#each seriesConfig as series (series.key)}
        <path
          class="learned-progress-chart__area"
          d={areaPath(series.key)}
          fill="url(#progress-fill-{series.key})"
        />
      {/each}

      {#each seriesConfig as series (series.key)}
        <path
          class="learned-progress-chart__line"
          d={linePath(series.key)}
          stroke={progressSeriesColors[series.key].line}
        />
      {/each}

      {#each seriesConfig as series (series.key)}
        {#each points as point, index (`${series.key}-${index}`)}
          <circle
            class="learned-progress-chart__point"
            cx={xPos(index)}
            cy={yPos(point[series.key])}
            r="3"
            fill={progressSeriesColors[series.key].point}
            stroke={progressSeriesColors[series.key].line}
          />
        {/each}
      {/each}

      {#each xLabelIndexes as index (index)}
        <text
          class="learned-progress-chart__axis learned-progress-chart__axis-x"
          x={xPos(index)}
          y={height - 14}
          text-anchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'}
        >
          {points[index]?.label}
        </text>
      {/each}
    </svg>
  </div>
</div>
