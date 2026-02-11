<script>
  import Product from "$lib/components/Product.svelte";
  import background from "$lib/assets/background.png";

  const stub = {
    title: "Armband RVS kruislock",
    price: 1895,
    discounted_price: 2995,
    image: background,
    product_id: 10,
  };

  const products = [stub, stub, stub, stub, stub];
</script>

<div id="wrapper" class="flex flex-wrap px-4 md:px-8 lg:px-16 pb-15">
  <div
    id="products"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
  >
    {#each products as item, i}
      {#if i == 3}
        <img
          src={background}
          alt=""
          class="rounded size-full aspect-square object-cover"
        />
      {/if}
      <Product {...item}></Product>
    {/each}
  </div>
</div>
