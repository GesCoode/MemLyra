<script lang="ts">
  export let title: string = "Armband RVS met kruislock Lorem Ipsum Dolor";
  export let price: string = "€ 18.95";
</script>

<div class="flex flex-row items-start gap-2 self-stretch">
  <div class="flex flex-col justify-center items-start flex-1">
    <p
      style="
        color: var(--heading, #212529);
        font-family: 'Open Sans', sans-serif;
        font-size: 14px;
        font-style: normal;
        font-weight: 300;
        line-height: normal;
        letter-spacing: -0.266px;
        margin: 0;
      "
    >
      {title}
    </p>
  </div>
  <p
    style="
      color: var(--heading, #212529);
      font-family: 'Open Sans', sans-serif;
      font-size: 14px;
      font-style: normal;
      font-weight: 300;
      line-height: normal;
      letter-spacing: -0.266px;
      margin: 0;
    "
  >
    {"€  " + price}
  </p>
</div>