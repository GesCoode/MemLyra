<script lang="ts">
  import background from "$lib/assets/background.png";
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
  import Button from "$lib/components/FieldBuilder/Button.svelte";
  import { slide } from "svelte/transition";

  type Lokkertje = {
    content: string;
  };
  type ExtraInfo = {
    title: string;
    content: string;
    visible: boolean;
  };
  type Props = {
    title: string;
    price: number; // cents
    discounted_price: number;
    image: string;
    product_id: number;
    subtitle: string;
    description: string;
    lokkertjes: Lokkertje[];
    extraInfo: ExtraInfo[];
  };

  let lokkertjesProp = [
    { content: "Binnen 4 dagen in huis" },
    { content: "Voldoende op voorraad" },
  ];

  let extraInfoProp = [
    {
      title: "MATERIAAL",
      content: "Deze armband is gemaakt van roestvrij staal",
      visible: false,
    },
    {
      title: "ACCOUNT",
      content: "Om deze armband te gebruiken heb je een account nodig!",
      visible: false,
    },
    {
      title: "WILSBESCHIKKING",
      content: "Deze armband is gemaakt van roestvrij staal",
      visible: false,
    },
    {
      title: "RETOUR",
      content: "Deze armband is gemaakt van roestvrij staal",
      visible: false,
    },
  ];

  let {
    title,
    price,
    discounted_price,
    image,
    product_id,
    subtitle,
    description,
    lokkertjes,
    extraInfo,
  }: Props = {
    title: "Armband RSV Kruislock",
    price: 3995,
    discounted_price: 5995,
    image: background,
    product_id: 1,
    subtitle: "Armband van RVS met kruislock schakels.",
    description:
      "Deze RVS armband met een kruislock tussen de plaatjes, is een mooi en sierlijk sieraad en is het zeer draag vriendelijk. Er zijn van dit sieraad maar een beperkt aantal beschikbaar. Speciaal gemaakt om als SOS armband, ID armband en ICE armband gebruikt te kunnen worden.",
    lokkertjes: lokkertjesProp,
    extraInfo: extraInfoProp,
  };

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

<div
  id="wrapper"
  class="flex flex-col gap-6 lg:flex-row px-4 md:px-8 lg:px-16 pb-15"
>
  <img
    src={image}
    class="size-full aspect-square object-cover rounded max-h-[50vh]"
    alt="product"
  />

  <div id="content" class="flex flex-col gap-10 w-full">
    <div id="textual" class="flex flex-col gap-6">
      <div
        id="top"
        class="flex flex-col gap-2 md:flex-row-reverse md:justify-between"
      >
        <div id="price" class="flex gap-4 flex-row justify-start">
          <p class="text-accent font-sans text-3xl">
            {toFormattedPrice(price)}
          </p>
          <p class="text-[#626669] font-light text-base leading-4">
            {toFormattedPrice(discounted_price)}
          </p>
        </div>

        <div id="titles" class="flex flex-col gap-2">
          <h1 class="text-heading font-sans font-medium text-4xl">{title}</h1>
          <p class="text-[#626669] font-light text-base leading-4">
            {subtitle}
          </p>
        </div>
      </div>

      <p class="text-paragraph font-light">{description}</p>
    </div>

    <div id="CTA" class="flex flex-col gap-3">
      <span class="font-bold">
        <Button content="In winkelwagen" />
      </span>

      <div id="lokkertjes" class="flex flex-col gap-1">
        {#each lokkertjes as lokkertje}
          <p class="text-green text-base font-light leading-6">
            {lokkertje.content}
          </p>
        {/each}
      </div>
    </div>

    <div id="extra_info">
      {#each extraInfo as info}
        <div class="flex flex-col gap-2 mb-2">
          <hr class="border-[#ABAEB1] h-px" />
          <div class="flex flex-row justify-between mx-3">
            <p class="font-bold text-heading">{info.title}</p>
            <button
              onclick={() => {
                extraInfo.map((i) => (i.visible = false));
                info.visible = !info.visible;
              }}
              class="font-extralight text-4xl leading-0 text-heading"
            >
              {#if info.visible}
                -
              {:else}
                +
              {/if}
            </button>
          </div>

          {#if info.visible}
            <div transition:slide={{ duration: 250 }}>
              <p class="text-paragraph mx-3 font-light">
                {info.content}
              </p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
