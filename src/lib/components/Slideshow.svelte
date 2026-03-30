<script lang="ts">
  import { onMount } from "svelte";
  import { gsap } from "gsap";

  import img1 from "$lib/assets/img1.png";
  import img2 from "$lib/assets/img2.png";
  import img3 from "$lib/assets/img3.png";
  import img4 from "$lib/assets/img4.png";
  import img5 from "$lib/assets/img5.png";

  const cards = [img1, img2, img3, img4, img5];

  let cardRefs: HTMLDivElement[] = Array(cards.length).fill(null);
  let circleRefs: HTMLDivElement[] = Array(cards.length).fill(null);

  let index = 0;
  let paused = false;
  let showText = false;

  const autoInterval = 5000;
  let interval: any;

  const verticalOffset = 60; // move all cards down by 60px
  const flyUpAmount = 20;    // reduced fly-up

  onMount(() => {
    updatePositions();
    interval = setInterval(() => {
      if (!paused) next();
    }, autoInterval);

    return () => clearInterval(interval);
  });

  function updatePositions() {
    cards.forEach((_, i) => {
      const card = cardRefs[i];
      const pos = (i - index + cards.length) % cards.length;

      if (pos === 0) {
        gsap.set(card, { zIndex: 20, scale: 1, rotation: 0, x: 0, y: verticalOffset, opacity: 1 });
      } else if (pos === 1) {
        gsap.set(card, { zIndex: 10, scale: 0.9, rotation: -4, x: 20, y: verticalOffset - 15, opacity: 0.7 });
      } else if (pos === 2) {
        gsap.set(card, { zIndex: 5, scale: 0.85, rotation: -6, x: 30, y: verticalOffset - 30, opacity: 0.4 });
      } else {
        gsap.set(card, { zIndex: 1, opacity: 0 });
      }
    });

    circleRefs.forEach((c, i) => {
      if (c) gsap.set(c, { backgroundColor: i === index ? "#000000" : "#ffffff" });
    });
  }

  function next() {
    const tl = gsap.timeline();
    const len = cards.length;
    const positions = [
      { zIndex: 20, scale: 1, rotation: 0, x: 0, y: verticalOffset, opacity: 1 },
      { zIndex: 10, scale: 0.9, rotation: -4, x: 20, y: verticalOffset - 30, opacity: 0.7 },
      { zIndex: 5, scale: 0.85, rotation: -6, x: 30, y: verticalOffset - 60, opacity: 0.4 }
    ];

    for (let offset = 0; offset < 3; offset++) {
      const nextIdx = (index + offset + 1) % len;
      const card = cardRefs[nextIdx];
      tl.to(card, { ...positions[offset], duration: 1, ease: "power4.inOut" }, 0);
    }

    // animate front card flying out
    const frontCard = cardRefs[index];
    tl.to(frontCard, {
      x: 100,
      y: verticalOffset - flyUpAmount,
      rotation: 12,
      opacity: 0,
      scale: 1,
      duration: 1,
      ease: "power4.inOut"
    }, 0);

    // circles animation
    const prevIndex = index;
    const nextIndex = (index + 1) % len;
    tl.to(circleRefs[prevIndex], { backgroundColor: "#ffffff", duration: 1, ease: "power1.inOut" }, 0);
    tl.to(circleRefs[nextIndex], { backgroundColor: "#000000", duration: 1, ease: "power1.inOut" }, 0);

    tl.call(() => {
      index = nextIndex;
    });
  }

  function goTo(idx: number) {
    if (idx === index) return;
    paused = true;
    index = idx - 1; // next() will advance it
    next();
  }
</script>

<!-- Slideshow container -->
<div
  class="relative w-[420px] h-[400px] mx-auto overflow-visible"
  style="perspective: 1200px;"
  on:mouseenter={() => { paused = true; showText = true; }}
  on:mouseleave={() => { paused = false; showText = false; }}
>
  <!-- Cards container -->
  <div class="absolute inset-0 flex justify-center items-start overflow-visible">
    {#each cards as card, i}
      <div
        class="absolute inset-0 rounded-xl overflow-hidden shadow-lg cursor-pointer"
        bind:this={cardRefs[i]}
        on:click={next}
      >
        <img src={card} alt="slide" class="w-full h-full object-cover" />
      </div>
    {/each}
  </div>

  <!-- Hover text top-right -->
  {#if showText}
    <div class="absolute top-2 right-2 z-50 pointer-events-none">
      <span class="text-white text-sm font-bold bg-black/50 px-3 py-1 rounded">
        klik voor volgende afbeelding
      </span>
    </div>
  {/if}
</div>

<!-- Circle queue in separate container -->
<div class="relative w-[420px] mx-auto mt-4 flex justify-center z-50">
  {#each cards as _, i}
    <div
      class="w-3 h-3 rounded-full cursor-pointer transition-colors mx-1"
      bind:this={circleRefs[i]}
      style="background-color: {i === index ? '#000000' : '#ffffff'}"
      on:click={() => goTo(i)}
    ></div>
  {/each}
</div>