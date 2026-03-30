<script lang="ts">
  import FieldBuilder from "$lib/components/FieldBuilder/FieldBuilder.svelte";
  import InputField from "$lib/components/FieldBuilder/InputField.svelte";
  import CustomButton from "$lib/components/form/CustomButton.svelte";

  let first_name = "";
  let last_name = "";
  let phone = "";
  let email = "";

  let postcode = "";
  let huisnummer = "";
  let toevoeging = "";
  let straat = "";
  let stad = "";

  // Cart stub with discounts
  let CART_STUB = {
    subtotaal: 1895,
    discounts: [
      { name: "15% Off korting", value: "-2.84" },
      { name: "20% Off korting", value: "-1.15" },
    ],
  };

  function handlePayment() {
    console.log(`Handle information:`);
  }

  function removeDiscount(index: number) {
    CART_STUB.discounts.splice(index, 1);
    CART_STUB = { ...CART_STUB }; // trigger reactivity
  }
</script>

<div id="wrapper" class="flex flex-col justify-center py-16 gap-2 px-4 md:px-8 xl:px-16 xl:gap-4">
  <h1 class="text-heading font-sans font-medium text-4xl">Bestellen</h1>

  <div class="flex flex-col md:flex-row justify-between gap-16">
    <!-- Field Wrapper -->
    <div id="fieldWrapper" class="w-full md:max-w-100 lg:max-w-none">
      <FieldBuilder title="">
        <!-- Personal Info -->
        <div class="flex flex-col gap-3">
          <div class="flex flex-col">
            <p class="font-bold">Persoonlijke Informatie</p>
            <p class="text-sm text-[#66686A]">*Verplichte velden</p>
          </div>

          <div class="flex flex-col gap-3 lg:gap-1 lg:flex-row">
            <div class="flex flex-col w-full">
              <InputField label="" bind:value={first_name} placeholder="Voornaam*" />
              <InputField label="" bind:value={last_name} placeholder="Achternaam*" />
            </div>
            <div class="flex flex-col w-full">
              <InputField label="" bind:value={phone} placeholder="Telefoonnummer*" />
              <InputField label="" bind:value={email} placeholder="Email adres*" />
            </div>
          </div>

          <p class="text-sm text-[#66686A] font-light leading-normal">
            Alleen bij vragen over de levering zullen wij contact met u opnemen.
          </p>
        </div>

        <!-- Delivery Address -->
        <div class="flex flex-col gap-3">
          <div class="flex flex-col">
            <p class="font-bold">Bezorgadres</p>
            <p class="text-sm text-[#66686A]">*Verplichte velden</p>
          </div>

          <div class="flex flex-col gap-1 xl:flex-row">
            <div class="flex flex-col w-full">
              <InputField label="" bind:value={postcode} placeholder="Postcode*" />
              <div class="flex gap-1">
                <InputField label="" bind:value={huisnummer} placeholder="Huisnummer*" />
                <InputField label="" bind:value={toevoeging} placeholder="Toevoeging" />
              </div>
            </div>

            <div class="flex flex-col w-full">
              <InputField label="" bind:value={straat} placeholder="Straat*" />
              <InputField label="" bind:value={stad} placeholder="Stad*" />
            </div>
          </div>
        </div>

        <!-- Main Checkout Button -->
        <CustomButton
          text="Controleer en betaal"
          rounded={true}
          bgColor="#0C3966"
          textColor="#FFF"
          outlineColor="#0C3966"
          outlineWidth={1}
          class="w-full"
          on:click={handlePayment}
        />
      </FieldBuilder>
    </div>

    <!-- Subtotal / Discounts -->
    <div id="subtotalWrapper" class="p-4 flex flex-col gap-4 h-fit border-border min-w-100 border rounded bg-primary">
      <!-- Subtotal -->
      <div id="subtotal" class="flex flex-col gap-2">
        <div class="flex justify-between">
          <p class="font-bold">Subtotaal</p>
          <p class="font-bold">€ {CART_STUB.subtotaal / 100}</p>
        </div>

        <!-- Discounts List -->
        <div class="flex flex-col gap-2">
          {#each CART_STUB.discounts as item, i (item)}
            <div class="flex flex-col">
              <div class="flex justify-between">
                <p class="font-light text-base">{item.name}</p>
                <p class="font-bold text-green">{item.value}</p>
              </div>

              <button
                class="font-light text-sm text-[#66686A] underline cursor-pointer text-left"
                on:click={() => removeDiscount(i)}
              >
                verwijderen
              </button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Delivery Info -->
      <div id="bezorgen" class="flex flex-col">
        <div class="flex justify-between">
          <p class="font-bold">Bezorgen</p>
          <p class="font-bold text-green">GRATIS</p>
        </div>
        <p class="text-green text-sm font-light">Binnen 4 dagen in huis!</p>
      </div>

      <hr class="border-[#ABAEB1]" />

      <!-- Total -->
      <div id="totaal" class="flex flex-col">
        <div class="flex justify-between">
          <p class="font-bold">
            Totaal <span class="font-light text-sm">Incl. BTW</span>
          </p>
          <p class="font-bold">€ {CART_STUB.subtotaal / 100}</p>
        </div>
        <p class="font-light text-[#66686A] text-sm">
          Je bespaart € 21,00 bij deze bestelling
        </p>
      </div>

      <hr class="border-[#ABAEB1]" />

      <!-- Voucher -->
      <p class="font-bold">Heb je een voucher of kortingscode?</p>
      <div class="flex gap-2">
        <InputField label="" placeholder="" />

        <div class="flex">
        <CustomButton
          text="Toevoegen"
          rounded={true}
          bgColor="#0C3966"
          textColor="#FFF"
          outlineColor="#0C3966"
          outlineWidth={1}
          class="w-full"
          on:click={handlePayment}
        />
        </div>
      </div>
    </div>
  </div>
</div>