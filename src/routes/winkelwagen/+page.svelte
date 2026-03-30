<script lang="ts">
  import CustomButton from "$lib/components/form/CustomButton.svelte";
  import ProductEntry from "$lib/components/ProductEntry.svelte";
  import update from "$lib/assets/update.svg";

  const products = [
    { title: "Armband RVS met kruislock Lorem Ipsum Dolor", price: 18.95 },
    { title: "Gold Necklace Classic", price: 45.50 },
    { title: "Leather Bracelet Minimalist", price: 22.30 }
  ];

  const fullPrice = products.reduce((sum, p) => sum + p.price, 0);

  const shippingCosts = 4.99;
  const shippingThreshold = 90.0;

  const shippingDisplay =
    fullPrice >= shippingThreshold
      ? "GRATIS"
      : `€ ${shippingCosts.toFixed(2)}`;
</script>

<div class="flex w-full min-h-screen">
  <div class="flex p-2 h-full w-[333px] flex-col items-start gap-4 bg-[#FFF] rounded-[2px]">
    <div class="flex flex-col items-start gap-2 self-stretch">

      <div class="flex flex-row items-start gap-2 self-stretch">
        <div class="flex flex-col justify-center items-start flex-1">
          <p style="margin:0; font-weight:700; font-size:16px; color:var(--paragraph,#292C2F);">
            Subtotaal
          </p>
        </div>
        <p style="margin:0; font-size:14px; color:var(--heading,#212529);">
          {"€ " + fullPrice.toFixed(2)}
        </p>
      </div>

      {#each products as product}
        <ProductEntry 
          title={product.title} 
          price={product.price.toFixed(2)} 
        />
      {/each}
    </div>

    <!-- Shipping -->
    <div class="flex flex-col w-full">
      <div class="flex flex-row items-start w-full">
        <div class="flex flex-1">
          <p style="margin:0; font-weight:700; font-size:16px;">
            Bezorgen
          </p>
        </div>
        <p style="margin:0; font-weight:700; color:var(--success,#0C6639);">
          {shippingDisplay}
        </p>
      </div>

      <div class="flex flex-row gap-1 items-center">
        <img src={update} />
        <p style="margin:0; font-size:14px; color:var(--success,#0C6639);">
          Binnen 4 dagen in huis
        </p>
      </div>

        {#if fullPrice < shippingThreshold}
        <p style="margin:0; font-size:14px; color:var(--success,#0C6639);">
            {"Voeg nog € " + (shippingThreshold - fullPrice).toFixed(2) + " toe voor gratis bezorging!"}
        </p>
        {/if}
    </div>

    <!-- Divider -->
    <div style="background:#ABAEB1; width:100%; height:0.5px;"></div>

    <!-- Total -->
    <div class="flex flex-row justify-between items-baseline w-full">
      <div class="flex gap-1 items-baseline">
        <p style="margin:0; font-weight:700; font-size:16px;">
          Totaal
        </p>
        <p style="margin:0; font-size:14px; color:#66686A;">
          Incl. BTW
        </p>
      </div>

      <p style="margin:0; font-weight:700; font-size:16px;">
        {(fullPrice + (shippingDisplay !== "GRATIS" ? shippingCosts : 0)).toFixed(2)}
      </p>
    </div>

    <!-- Divider -->
    <div style="background:#ABAEB1; width:100%; height:0.5px;"></div>

    <!-- Button -->
    <div class="flex w-full py-2">
      <CustomButton
        text="Veilig bestellen"
        rounded={true}
        bgColor="#0C3966"
        textColor="#FFFFFF"
        on:click={() => (window.location.href = "/producten")}
      />
    </div>

  </div>
</div>