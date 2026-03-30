<script lang="ts">
  import { slide } from "svelte/transition";
  import arrowDown from "$lib/assets/keyboard_arrow_down.svg";
  import { onMount } from "svelte";

  // Props to make the component reusable
  export let title: string = "Price";
  export let min: number = 0;
  export let max: number = 100;
  export let gapPercent: number = 5; // Minimum gap between handles in percent

  // Collapsible state
  let open = true;

  // Slider references
  let sliderRef: HTMLDivElement;
  let sliderWidth = 0;

  // Values for handles
  let minValue = min;
  let maxValue = max;
  const minGap = (gapPercent / 100) * (max - min);

  function toggle() {
    open = !open;
  }

  function positionToValue(pos: number) {
    return min + (pos / sliderWidth) * (max - min);
  }

  function clamp(value: number, minVal: number, maxVal: number) {
    return Math.min(Math.max(value, minVal), maxVal);
  }

  function startDrag(handle: "min" | "max", event: PointerEvent) {
    event.preventDefault();
    const handleMove = (e: PointerEvent) => {
      if (!sliderRef) return;
      const rect = sliderRef.getBoundingClientRect();
      let value = positionToValue(e.clientX - rect.left);
      value = Math.round(value); // ensure integer
      if (handle === "min") {
        minValue = clamp(value, min, maxValue - minGap);
      } else {
        maxValue = clamp(value, minValue + minGap, max);
      }
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  onMount(() => {
    sliderWidth = sliderRef.clientWidth;
    const resizeObserver = new ResizeObserver(() => {
      sliderWidth = sliderRef.clientWidth;
    });
    resizeObserver.observe(sliderRef);
  });

  function updateMin(e: Event) {
    let val = Math.round(Number((e.target as HTMLInputElement).value));
    minValue = clamp(val, min, maxValue - minGap);
  }

  function updateMax(e: Event) {
    let val = Math.round(Number((e.target as HTMLInputElement).value));
    maxValue = clamp(val, minValue + minGap, max);
  }
</script>

<div class="flex flex-col items-start self-stretch bg-white rounded">
  <!-- Header -->
  <div class="flex justify-between items-center w-full cursor-pointer" on:click={toggle}>
    <div class="text-[14px] font-bold tracking-[-0.266px] text-[#292C2F] font-sans">{title}</div>
    <img
      src={arrowDown}
      alt="arrow"
      class="w-6 h-6 transition-transform duration-300"
      style="transform: rotate({open ? 180 : 0}deg)"
    />
  </div>

  <div class="w-full border-t border-[#ABAEB1]"></div>

  <!-- Collapsible content -->
  {#if open}
    <div transition:slide={{ duration: 250 }} class="flex flex-col gap-3">
      <!-- Input Fields -->
      <div class="flex gap-2 pt-2">
        <input
          type="number"
          class="w-16 border rounded px-1 text-[14px]"
          bind:value={minValue}
          min={min}
          max={maxValue - minGap}
          on:input={updateMin}
        />
        <input
          type="number"
          class="w-16 border rounded px-1 text-[14px]"
          bind:value={maxValue}
          min={minValue + minGap}
          max={max}
          on:input={updateMax}
        />
      </div>

      <!-- Slider -->
      <div bind:this={sliderRef} class="relative w-full h-4">
        <div class="absolute h-1 bg-gray-300 rounded-full top-1/2 -translate-y-1/2 w-full"></div>
        <div
          class="absolute h-1 bg-blue-500 rounded-full top-1/2 -translate-y-1/2"
          style="left: {(minValue - min) / (max - min) * 100}%; width: {(maxValue - minValue) / (max - min) * 100}%;"
        ></div>
        <div
          class="absolute w-4 h-4 bg-white border border-gray-500 rounded-full top-1/2 cursor-pointer z-10"
          style="left: {(minValue - min) / (max - min) * 100}%; transform: translateX(-50%) translateY(-50%)"
          on:pointerdown={(e) => startDrag("min", e)}
        ></div>
        <div
          class="absolute w-4 h-4 bg-white border border-gray-500 rounded-full top-1/2 cursor-pointer z-10"
          style="left: {(maxValue - min) / (max - min) * 100}%; transform: translateX(-50%) translateY(-50%)"
          on:pointerdown={(e) => startDrag("max", e)}
        ></div>
      </div>

      <!-- Range Labels -->
      <div class="flex justify-between text-[12px] w-full text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  {/if}
</div>