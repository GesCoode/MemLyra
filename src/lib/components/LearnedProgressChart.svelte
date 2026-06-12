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
  const basePadding = { top: 24, right: 24, bottom: 44, left: 52 };
  const targetAxisFontY = 12;
  const targetAxisFontX = 13;

  const seriesConfig: { key: ProgressSeriesKey; label: string }[] = [
    { key: 'learned', label: 'Learned' },
    { key: 'mastered', label: 'Mastered' },
    { key: 'bothWays', label: 'Both ways' }
  ];

  let canvasWrapEl = $state<HTMLDivElement | null>(null);
  let displayWidth = $state(width);

  let points = $derived(buildLearnedProgressSeries(cards, startDate, endDate));
  let maxCount = $derived.by(() => {
    if (points.length === 0) return 1;
    return Math.max(...points.flatMap((point) => [point.learned, point.mastered, point.bothWays]), 1);
  });
  let latest = $derived(points.at(-1) ?? { learned: 0, mastered: 0, bothWays: 0 });

  let displayScale = $derived(displayWidth / width);
  let axisFontSizeY = $derived(
    Math.round(targetAxisFontY / Math.max(displayScale, 0.001))
  );
  let axisFontSizeX = $derived(
    Math.round(targetAxisFontX / Math.max(displayScale, 0.001))
  );

  let yTicks = $derived(
    maxCount <= 4
      ? Array.from({ length: maxCount + 1 }, (_, index) => index)
      : [0, Math.round(maxCount / 2), maxCount]
  );

  let yLabelChars = $derived(Math.max(1, ...yTicks.map((tick) => String(tick).length)));

  let chartPadding = $derived({
    top: basePadding.top,
    right: basePadding.right,
    bottom: Math.max(basePadding.bottom, axisFontSizeX + 22),
    left: Math.max(basePadding.left, Math.round(axisFontSizeY * yLabelChars * 0.65 + 14))
  });

  let plotWidth = $derived(width - chartPadding.left - chartPadding.right);
  let plotHeight = $derived(height - chartPadding.top - chartPadding.bottom);

  let xLabelIndexes = $derived.by(() => {
    if (points.length <= 1) return [0];
    if (points.length === 2) return [0, 1];
    const middle = Math.floor((points.length - 1) / 2);
    return [0, middle, points.length - 1];
  });

  let periodLabel = $derived(`${formatChartDate(startDate)} – ${formatChartDate(endDate)}`);

  $effect(() => {
    const el = canvasWrapEl;
    if (!el) return;

    const updateWidth = () => {
      displayWidth = el.getBoundingClientRect().width || width;
    };

    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(el);
    return () => observer.disconnect();
  });

  function xPos(index: number): number {
    if (points.length <= 1) return chartPadding.left + plotWidth / 2;
    return chartPadding.left + (index / (points.length - 1)) * plotWidth;
  }

  function yPos(count: number): number {
    return chartPadding.top + plotHeight - (count / maxCount) * plotHeight;
  }

  function linePath(key: ProgressSeriesKey): string {
    return points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${xPos(index)} ${yPos(point[key])}`)
      .join(' ');
  }

  function areaPath(key: ProgressSeriesKey): string {
    const line = linePath(key);
    if (!line) return '';
    return `${line} L ${xPos(points.length - 1)} ${chartPadding.top + plotHeight} L ${xPos(0)} ${chartPadding.top + plotHeight} Z`;
  }
</script>

<div class="learned-progress-chart">
  <div class="learned-progress-chart__header">
    <div>
      <h2 class="learned-progress-chart__title">Learning progress</h2>
      <p class="learned-progress-chart__desc">
        <span class="learned-progress-chart__summary">
          {latest.learned} learned · {latest.mastered} mastered · {latest.bothWays} both ways
        </span>
        <span class="learned-progress-chart__period">{periodLabel}</span>
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

  <div class="learned-progress-chart__canvas-wrap" bind:this={canvasWrapEl}>
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
          x1={chartPadding.left}
          x2={width - chartPadding.right}
          y1={yPos(tick)}
          y2={yPos(tick)}
        />
        <text
          class="learned-progress-chart__axis"
          x={chartPadding.left - 10}
          y={yPos(tick) + 4}
          text-anchor="end"
          font-size={axisFontSizeY}
        >
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
          font-size={axisFontSizeX}
        >
          {points[index]?.label}
        </text>
      {/each}
    </svg>
  </div>
</div>
