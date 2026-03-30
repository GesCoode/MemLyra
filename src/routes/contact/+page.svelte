<script lang="ts">
  import FieldBuilder from "$lib/components/FieldBuilder/FieldBuilder.svelte";
  import InputField from "$lib/components/FieldBuilder/InputField.svelte";
  import CustomButton from "$lib/components/form/CustomButton.svelte";
  import ResizableTextarea from "$lib/components/form/ResizableTextarea.svelte";

  function handleVermeldingVerwijderen(id: number) {
    // implement removal logic here
  }

  let code = "";

  function handle2fa() {
    console.log(`Handle 2FA: ${code}`);
  }

  function cancel() {
    console.log("Cancel");
  }

  function sendForm() {
    console.log(`Sending form`);
  }
</script>

<div
  id="wrapper"
  class="flex flex-col h-full gap-4 py-4 h-dvh px-4 md:px-8 xl:px-16"
>
  <h1 class="text-4xl">Contact</h1>

  <p style="margin: 0; line-height: 160%; font-family: 'Open Sans', sans-serif;">
  <span
    style="
      color: var(--accent, #0C3966);
      font-weight: 700;
      font-size: 16px;
      letter-spacing: -0.304px;
    "
  >
    Heb je vragen? We helpen je graag verder. 
  </span>
  <span
    style="
      color: var(--paragraph, #292C2F);
      font-weight: 300;
      font-size: 16px;
      letter-spacing: -0.304px;
    "
  >
    Neem contact met ons op via onderstaande gegevens of vul direct het formulier in. Wij komen dan zo spoedig mogelijk bij je terug.
  </span>
</p>

<p
  style="
    margin: 0;
    line-height: 160%;
    font-family: 'Open Sans', sans-serif;
    font-size: 16px;
    color: var(--paragraph, #292C2F);
    letter-spacing: -0.304px;
  "
>
  <span style="font-weight: 300;">
    E-Mail: 
  </span>
  <span style="font-weight: 700;">
    team@sostag.nl
  </span>
  <br />
  <span style="font-weight: 300;">
    Telefoon: 
  </span>
  <span style="font-weight: 700;">
    (06) 402 188 79
  </span>
</p>


  <div id="fieldWrapper" class="w-full">
    <FieldBuilder title="">
      <div class="flex flex-col md:flex-row justify-between">
        <p class="font-bold">Persoonlijke informatie</p>
        <p class="text-light text-sm">*verplichte velden</p>
      </div>

      <div class="flex flex-col gap-2 md:flex-row md:gap-1">
        <div class="flex flex-col w-full">
          <InputField
            label=""
            bind:value={code}
            placeholder="Voornaam*"
          />
          <InputField
            label=""
            bind:value={code}
            placeholder="Achternaam"
          />
        </div>

        <div class="flex flex-col w-full">
          <InputField
            label=""
            bind:value={code}
            placeholder="Telefoonnummer"
          />
          <InputField
            label=""
            bind:value={code}
            placeholder="Email adres*"
          />
        </div>
      </div>

      <div class="w-full h-full">
        <ResizableTextarea
          label="Vermelding"
          id="Vermelding"
        />
      </div>

      <div class="flex w-full mt-2">
        <CustomButton
          text="Verstuur bericht"
          rounded={true}
          bgColor="#0C3966"
          textColor="#FFF"
          outlineColor="#0C3966"
          outlineWidth={0}
          on:click={sendForm}
        />
      </div>
    </FieldBuilder>
  </div>
</div>