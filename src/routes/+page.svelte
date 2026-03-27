<!-- HOMEPAGE -->

<script lang="ts">
  import background from "$lib/assets/background.png";
  import medical from "$lib/assets/medical.svg";
  import rightArrow from '$lib/assets/rightArrow.svg';

  import Login from "$lib/components/Login.svelte";
  import Slideshow from "$lib/components/Slideshow.svelte";
  import CustomButton from "$lib/components/form/CustomButton.svelte";
</script>

<div id="wrapper" class="w-full flex flex-col gap-16 pb-8">

  <!-- Banner -->
  <div
    id="hero"
    class="relative flex flex-col lg:flex-row gap-8 lg:gap-20 px-4 sm:px-16 text-center sm:text-left justify-center sm:items-start lg:items-center py-16 bg-linear-to-bl from-black/0 to-black/30 overflow-hidden bg-cover bg-center"
    style="background-image: url('{background}')"
  >

    <!-- LEFT: TEXT -->
    <div class="flex-1 flex flex-col gap-9">
      <h1 class="text-primary text-6xl font-medium font-sans max-w-xl">
        Veiligheid binnen handbereik met SOS tag
      </h1>

      <p class="text-primary max-w-xl">
        Met SOS tag ben je altijd voorbereid op noodsituaties. Scan de QR-code en
        krijg direct toegang tot belangrijke medische informatie
      </p>

      <div class="flex justify-center sm:justify-start gap-4">
        <div class="flex w-auto items-start mt-2">
          <CustomButton
              text="Ontdek"
              rounded={true}
              bgColor="#0C3966"
              textColor="#FFFFFF"
              on:click={() => window.location.href = "/producten"}
          />
        </div>
        <div class="flex w-auto items-start mt-2">
          <CustomButton
              text="Aanmelden"
              rounded={true}
              bgColor="rgba(255, 255, 255, 0.1)"
              textColor="#FFFFFF"
              on:click={() => console.log("Aanmelden clicked")}
              class="backdrop-blur-lg"
          />
        </div>
      </div>
    </div>

    <!-- RIGHT: LOGIN (desktop only) -->
    <div class="hidden lg:flex flex-1 justify-end">
      <div class="w-full max-w-sm">
        <Login />
      </div>
    </div>

  </div>

  <!-- LOGIN BELOW HERO (mobile only) -->
  <div id="sign_in" class="px-4 py-8 lg:hidden">
    <Login />
  </div>

  <!-- ABOUT -->
  <div class="flex flex-row lg:px-16">
  <div id="about" class="px-4 flex flex-col gap-8">
    <div id="top">
      <p class="text-accent text-lg font-semibold font-sans -my-2">
        Wat is SOStag
      </p>

      <h2 class="text-heading text-4xl font-bold font-sans capitalize leading-14">
        Snelle Toegang Tot Uw Medische Informatie
      </h2>

      <p>
        Een SOStag is een medisch hulpmiddel dat gedragen wordt als een sieraad.
        Met een SOStag draagt u uw medische gegevens altijd met u mee. Elke
        SOStag bevat een unieke QR-code die een hulpverlener met een smartphone
        kan scannen. Meteen wordt alle belangrijke informatie getoond.
        Belangrijk als elke seconde telt.
      </p>
    </div>

<div id="highlights" class="flex flex-col md:flex-row md:justify-between gap-4 md:gap-8">
  <!-- HIGHLIGHT 1 (left) -->
  <div>
    <div class="flex h-7 items-center gap-2">
      <img src={medical} />

      <p class="text-heading text-lg font-bold font-sans leading-7">
        Directe toegang
      </p>
    </div>

    <p class="max-w-[28ch]">
      Scan de QR-code en krijg onmiddellijk toegang tot uw medische geschiedenis.
    </p>
  </div>

  <!-- HIGHLIGHT 2 (right) -->
  <div class="md:text-right">
    <div class="flex h-7 items-center gap-2 md:justify-end">
      <img src={medical} />

      <p class="text-heading text-lg font-bold font-sans leading-7">
        Veiligheid eerst
      </p>
    </div>

    <p class="max-w-[28ch] md:ml-auto">
      Zorg ervoor dat hulpverleners snel de juiste informatie hebben.
    </p>
  </div>
</div>
    <div class="flex gap-5">
        <div class="flex w-auto items-start mt-2">
          <CustomButton
              text="Bekijk ons aanbod"
              rounded={true}
              bgColor="#0C3966"
              textColor="#FFFFFF"
              on:click={() => window.location.href = "/producten"}
          />
        </div>

        <div class="flex w-auto items-start mt-2">
          <CustomButton
              text="Meer info"
              rounded={true}
              bgColor=""
              textColor="#00000"
              on:click={() => window.location.href = "/producten"}
              class="backdrop-blur-lg"
          />
        </div>
    </div>
    </div>
      <div class="px-4 w-full hidden lg:flex justify-center">
        <div class="w-[480px] h-[560px] relative overflow-hidden">
          <Slideshow />
        </div>
      </div>
  </div>

  <div class="flex flex-col items-center gap-8 self-stretch lg:px-16 px-4">
      <h1
        style="
          color: var(--heading, #212529);
          font-feature-settings: 'ss04' on;
          font-family: 'Spline Sans', sans-serif;
          font-size: 45px;
          line-height: 54px;
        "
        class="text-center font-semibold"
      >
        Bekijk ons aanbod
      </h1>

      <!-- GRID DESKTOP IPAD -->
      <div class="flex flex-col items-start gap-3 self-stretch hidden sm:block">
      <style>
        .my-grid {
          display: grid;
          height: 600px;
          gap: 16px;
          align-self: stretch;
          grid-template-rows: 2fr 1fr 1fr;
          grid-template-columns: repeat(4, 1fr);
        }
      </style>

        <div class="grid w-full h-[600px] gap-4 grid-rows-3 grid-cols-4">
          <div 
            class="row-span-2 col-span-1 self-stretch justify-self-stretch bg-[#CCE0F5]">
          </div>

          <div 
            class="row-span-1 col-span-1 self-stretch justify-self-stretch bg-[#CCE0F5]">
          </div>

          <div
            class="h-[320px] self-start row-start-2 row-span-1 col-start-3 col-span-1 justify-self-stretch bg-[#CCE0F5]">
          </div>

          <div class="self-stretch row-start-2 row-span-2 col-start-4 col-span-1 justify-self-stretch bg-[#CCE0F5]">
          </div>
          
          <div class="self-start row-start-1 row-span-1 col-start-3 col-span-2 justify-self-start bg-[#CCE0F5] w-full h-full">
          </div>
          
          <div class="row-span-1 col-span-1 self-stretch justify-self-stretch bg-[#CCE0F5]">
          </div>

          <div class="flex flex-col items-start gap-2 p-2 self-stretch row-start-3 row-span-1 col-start-1 col-span-2 justify-self-stretch">
            <div class="flex px-4 flex-col items-start gap-4 self-stretch">
              <div class="flex flex-col items-start gap-3 self-stretch">
                <p class="text-[24px] font-semibold leading-[28px] tracking-[-0.24px] text-[var(--accent,#0C3966)] font-spline">
                  Producten die <span class="font-bold text-[var(--heading,#212529)]">levens redden</span>
                </p>
                
                <p class="text-[18px] font-normal leading-[28px] tracking-[-0.18px] text-[var(--paragraph,#292C2F)] font-open">
                  Het is waar, onze producten hebben al tig levens gered. Account niet meegeleverd.                
                </p>
              </div>
              <div class="flex items-center gap-1">
              <p class="text-[18px] font-normal leading-[28px] tracking-[-0.18px] text-[var(--accent,#0C3966)] font-open">
                Bekijk de collectie              
              </p>

              <img src={rightArrow} alt="icon" class="inline w-7 h-7" />

              </div>
            </div>
          </div>

        </div>
      </div>


      <!-- MOBILE GRID -->
      <div class="flex flex-col gap-3 sm:hidden">
        <div class="flex flex-col items-start gap-3 self-stretch">
          <div class="grid w-full h-[400px] gap-4 grid-rows-2 grid-cols-2">
            
            <!-- LEFT block (spans 2 rows) -->
            <div class="row-span-2 col-span-1 bg-[#CCE0F5] flex items-center justify-center">
            </div>

            <!-- TOP RIGHT block -->
            <div class="row-span-1 col-span-1 bg-[#CCE0F5] flex items-center justify-center">
            </div>

            <!-- BOTTOM RIGHT block -->
            <div class="row-span-1 col-span-1 bg-[#CCE0F5] flex items-center justify-center">
            </div>

          </div>
        </div>

        <div class="flex flex-col items-start gap-2 self-stretch row-start-3 row-span-1 col-start-1 col-span-2 justify-self-stretch">
            <div class="flex flex-col items-start gap-4 self-stretch">
              <div class="flex flex-col items-start gap-3 self-stretch">
                <p class="text-[24px] font-semibold leading-[28px] tracking-[-0.24px] text-[var(--accent,#0C3966)] font-spline">
                  Producten die <span class="font-bold text-[var(--heading,#212529)]">levens redden</span>
                </p>
                
                <p class="text-[18px] font-normal leading-[28px] tracking-[-0.18px] text-[var(--paragraph,#292C2F)] font-open">
                  Het is waar, onze producten hebben al tig levens gered. Account niet meegeleverd.                
                </p>
              </div>
              <div class="flex items-center gap-1">
              <p class="text-[18px] font-normal leading-[28px] tracking-[-0.18px] text-[var(--accent,#0C3966)] font-open">
                Bekijk de collectie              
              </p>

              <img src={rightArrow} alt="icon" class="inline w-7 h-7" />

              </div>
            </div>
          </div>

      </div>

  </div>
</div>