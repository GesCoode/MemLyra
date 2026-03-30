<script lang="ts">
  import logo from "$lib/assets/logo.png";

  const contentBlocks = [
    {
      heading: "Informatie",
      links: [
        "Leveringsvoorwaarden",
        "Uw privacy",
        "Hoe en wat informatie",
        "Samenwerking",
      ],
    },
    {
      heading: "Neem contact op",
      links: ["(06) 402 188 79", "team@sostag.nl"],
    },
    {
      heading: "Ons adres",
      links: ["Prinses Christinalaan 8\n7437XZ Bathmen"],
    },
    {
      heading: "Over ons",
      links: ["KVK: 553 019 32", "IBAN: NL86 INGB 0653 3301 38"],
    },
  ];
</script>

<div id="wrapper" class="bg-accent px-4 py-10 flex flex-col gap-5">
  <div id="branding" class="h-[108px] flex justify-between items-center">
    <img src={logo} class="h-full" />

    <!-- <div class="flex flex-col gap-5">
      <p class="text-2xl text-white">team@sostag.nl</p>
      <p class="text-2xl text-white">06-402 188 79</p>
    </div> -->
  </div>

  <hr class="w-full border-t border-white" />

<div id="content" class="flex gap-8 flex-wrap">
  {#each contentBlocks as block}
    <div class="flex flex-col gap-1">
      <p class="text-white font-bold">{block.heading}</p>

      {#each block.links as link}
        {#if block.heading === "Informatie"}
          <!-- Only clickable links for "Informatie" -->
          <p
            class="font-light text-white cursor-pointer hover:text-yellow-400 transition-colors duration-200"
            on:click={() => console.log(`Clicked on: ${link}`)}
          >
            {link}
          </p>
        {:else}
          <!-- Normal text for other blocks -->
          <p class="font-light text-white">{link}</p>
        {/if}
      {/each}
    </div>
  {/each}
</div>
</div>
