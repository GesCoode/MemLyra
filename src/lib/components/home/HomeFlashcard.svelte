<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  const phrases = [
    { text: 'Regístrate gratis ahora', dir: 'ltr' as const },
    { text: 'Sign up for free now', dir: 'ltr' as const },
    { text: 'Inscrivez-vous gratuitement', dir: 'ltr' as const },
    { text: '今すぐ無料で登録', dir: 'ltr' as const },
    { text: 'Jetzt kostenlos registrieren', dir: 'ltr' as const },
    { text: '지금 무료로 가입하세요', dir: 'ltr' as const },
    { text: '立即免费注册', dir: 'ltr' as const },
    { text: 'Meld je nu gratis aan', dir: 'ltr' as const },
    { text: 'سجّل مجانًا الآن', dir: 'rtl' as const },
    { text: 'Iscriviti gratis ora', dir: 'ltr' as const },
    { text: 'अभी मुफ्त में साइन अप करें', dir: 'ltr' as const },
    { text: 'สมัครฟรีตอนนี้', dir: 'ltr' as const },
    { text: 'Cadastre-se grátis agora', dir: 'ltr' as const },
    { text: 'Đăng ký miễn phí ngay', dir: 'ltr' as const },
    { text: 'Zarejestruj się za darmo', dir: 'ltr' as const },
    { text: 'Daftar gratis sekarang', dir: 'ltr' as const },
    { text: 'Registrera dig gratis nu', dir: 'ltr' as const },
    { text: 'এখনই বিনামূল্যে সাইন আপ করুন', dir: 'ltr' as const },
    { text: 'இப்போது இலவசமாக பதிவு செய்யுங்கள்', dir: 'ltr' as const },
    { text: 'Registrer deg gratis nå', dir: 'ltr' as const },
    { text: 'Jisajili bure sasa', dir: 'ltr' as const },
    { text: 'Tilmeld dig gratis nu', dir: 'ltr' as const },
    { text: 'הירשמו בחינם עכשיו', dir: 'rtl' as const },
    { text: 'همین الان رایگان ثبت‌نام کنید', dir: 'rtl' as const },
    { text: 'Εγγραφείτε δωρεάν τώρα', dir: 'ltr' as const },
    { text: 'ابھی مفت سائن اپ کریں', dir: 'rtl' as const },
    { text: 'Zaregistrujte se zdarma', dir: 'ltr' as const },
    { text: 'Mag-sign up nang libre ngayon', dir: 'ltr' as const },
    { text: 'Şimdi ücretsiz kaydol', dir: 'ltr' as const }
  ];

  const pauseMs = 4000;
  const flipMs = 650;

  let index = $state(0);
  let flipped = $state(false);
  let snap = $state(false);

  let nextIndex = $derived((index + 1) % phrases.length);
  let current = $derived(phrases[index]);
  let next = $derived(phrases[nextIndex]);

  onMount(() => {
    if (!browser) return;

    let pauseTimeoutId: number | undefined;
    let flipTimeoutId: number | undefined;

    function finishFlip() {
      snap = true;
      index = nextIndex;
      flipped = false;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          snap = false;
          scheduleFlip();
        });
      });
    }

    function scheduleFlip() {
      pauseTimeoutId = window.setTimeout(() => {
        flipped = true;

        flipTimeoutId = window.setTimeout(finishFlip, flipMs);
      }, pauseMs);
    }

    scheduleFlip();

    return () => {
      if (pauseTimeoutId !== undefined) window.clearTimeout(pauseTimeoutId);
      if (flipTimeoutId !== undefined) window.clearTimeout(flipTimeoutId);
    };
  });
</script>

<div class="home-flashcard" aria-live="polite" aria-atomic="true">
  <div class="home-flashcard__shadow" class:home-flashcard__shadow-active={flipped}></div>

  <div class="home-flashcard__scene">
    <div
      class="home-flashcard__card"
      class:home-flashcard__card--flipped={flipped}
      class:home-flashcard__card--snap={snap}
    >
      <div class="home-flashcard__side home-flashcard__side--front">
        <p class="home-flashcard__text" dir={current.dir}>{current.text}</p>
      </div>

      <div class="home-flashcard__side home-flashcard__side--back">
        <p class="home-flashcard__text" dir={next.dir}>{next.text}</p>
      </div>
    </div>
  </div>
</div>
