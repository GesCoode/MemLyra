<script>
  import Product from "$lib/components/Product.svelte";
  import background from "$lib/assets/background.png";
  import Filter from "$lib/components/Filter.svelte";
  import arrowDown from "$lib/assets/keyboard_arrow_down.svg";
  import FilterDropdown from "$lib/components/FilterDropdown.svelte";
  import FilterSlides from "$lib/components/FilterSlides.svelte";
  import { slide } from "svelte/transition";
  import ProductPreview from "$lib/components/ProductPreview.svelte";

  const stub = {
    title: "Armband RVS kruislock",
    price: 1895,
    discounted_price: 2995,
    image: background,
    product_id: 10,
  };

  const products = [stub, stub, stub, stub, stub];

  // Controls collapsible filter on small/medium screens
  let openFilters = false;

  function toggleFilters() {
    openFilters = !openFilters;
  }
</script>

<div class="flex flex-col gap-3 px-4 md:px-8 lg:px-16 pb-15">
  <!-- Collapsible Filter (hidden on lg+) -->
  <div class="lg:hidden flex flex-col w-full rounded bg-[var(--accent,#0C3966)]">
    <!-- Header -->
    <div
      class="flex justify-center items-center cursor-pointer p-2 text-white font-sans font-semibold text-[16px]"
      on:click={toggleFilters}
    >
      <span>Filter producten</span>
      <img
        src={arrowDown}
        alt="arrow"
        class="w-6 h-6 transition-transform duration-300"
        style="transform: rotate({openFilters ? 180 : 0}deg); filter: invert(1);"
      />
    </div>

    <!-- Collapsible Content -->
    {#if openFilters}
      <div transition:slide={{ duration: 200 }}>
        <div class="flex flex-row w-full items-start bg-white px-4 py-4 gap-4">
          <div class="flex flex-col w-full gap-2">
            <FilterDropdown title="Kleur" options={['Groen', 'Rood', 'Zilver']} />
            <FilterDropdown title="Materiaal" options={['Roestvrij staal','Staal','Siliconen', 'Klittenband']} />
          </div>
          
          <div class="flex flex-col w-full gap-2">
            <FilterSlides title="Prijs (€)" min={0} max={100} />
            <FilterSlides title="Lengte (mm)" min={1} max={400} />
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Products Section -->
  <div class="flex flex-row gap-3">
    <!-- Sidebar filter for lg+ screens -->
    <div class="flex h-full hidden lg:block">
      <Filter />
    </div>

    <!-- Products grid -->
    <div id="wrapper" class="flex flex-wrap">
      <div id="products" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {#each products as item, i}
          {#if i == 3}
            <img
              src={background}
              alt=""
              class="rounded size-full aspect-square object-cover"
            />
          {/if}
          <Product {...item} />
        {/each}
      </div>
    </div>
  </div>
</div>

