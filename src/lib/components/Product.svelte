<script lang="ts">
  import CustomButton from "./form/CustomButton.svelte";
  

  type Props = {
    title: string;
    price: number; // cents
    discounted_price: number;
    image: string;
    product_id: number;
  };

  let { title, price, discounted_price, image, product_id }: Props = $props();

  /**
   * Take a price and format it accordingly
   * @param price takes a price in cents and formats it to euros
   */
  function toFormattedPrice(price: number) {
    return (price / 100).toString().replace(/\./, ","); // might be a better way idk man
  }

  function getDiscount(price: number, discounted: number) {
    const discount_amount = discounted - price;
    const fraction = discount_amount / discounted;
    return Math.round(fraction * 100);
  }

  function addToCart() {
    console.log(`Added ${product_id} to cart`);
  }
</script>

<div id="wrapper" class="w-full flex flex-col bg-white rounded overflow-hidden">
  <img src={image} alt="" class="w-full" />

  <div id="content" class="flex flex-col gap-4 px-4 py-4">
    <p class="text-heading font-bold">{title}</p>

    <div class="flex flex-row justify-between items-end">
      <div class="flex flex-col">
        {#if discounted_price > price}
          <div id="discount" class="flex gap-2 items-center">
            <p class="line-through text-[#3F4347]">
              {toFormattedPrice(discounted_price)}
            </p>

            <div
              class="flex justify-center items-center w-fit h-4 rounded px-1 bg-[#CCE0F5]"
            >
              <p class="text-accent text-sm">
                -{getDiscount(price, discounted_price)}%
              </p>
            </div>
          </div>
        {/if}

        <p class="font-sans text-heading text-2xl">{toFormattedPrice(price)}</p>
      </div>

      <div class="flex items-center gap-[9px] rounded-sm bg-[var(--accent,#0C3966)]">
        <CustomButton
          text="Bekijk product"
          rounded={true}
          bgColor="rgba(255, 255, 255, 0.1)"
          textColor="#FFF"
          outlineColor="#0C3966"
          outlineWidth={1}
          class=""
          on:click={addToCart}/>
      </div>
    </div>
  </div>
</div>
