<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  type Phrase = {
    text: string;
    dir: 'ltr' | 'rtl';
    language: string;
  };

  /** Same meaning in every language — each pair translates along the chain. */
  const phrases: Phrase[] = [
    { text: 'Regístrate gratis ahora', dir: 'ltr', language: 'Spanish' },
    { text: 'Sign up for free now', dir: 'ltr', language: 'English' },
    { text: 'Inscrivez-vous gratuitement', dir: 'ltr', language: 'French' },
    { text: '今すぐ無料で登録', dir: 'ltr', language: 'Japanese' },
    { text: 'Jetzt kostenlos registrieren', dir: 'ltr', language: 'German' },
    { text: '지금 무료로 가입하세요', dir: 'ltr', language: 'Korean' },
    { text: '立即免费注册', dir: 'ltr', language: 'Mandarin' },
    { text: 'Meld je nu gratis aan', dir: 'ltr', language: 'Dutch' },
    { text: 'سجّل مجانًا الآن', dir: 'rtl', language: 'Arabic' },
    { text: 'Iscriviti gratis ora', dir: 'ltr', language: 'Italian' },
    { text: 'अभी मुफ्त में साइन अप करें', dir: 'ltr', language: 'Hindi' },
    { text: 'สมัครฟรีตอนนี้', dir: 'ltr', language: 'Thai' },
    { text: 'Cadastre-se grátis agora', dir: 'ltr', language: 'Portuguese' },
    { text: 'Đăng ký miễn phí ngay', dir: 'ltr', language: 'Vietnamese' },
    { text: 'Zarejestruj się za darmo', dir: 'ltr', language: 'Polish' },
    { text: 'Daftar gratis sekarang', dir: 'ltr', language: 'Indonesian' },
    { text: 'Registrera dig gratis nu', dir: 'ltr', language: 'Swedish' },
    { text: 'এখনই বিনামূল্যে সাইন আপ করুন', dir: 'ltr', language: 'Bengali' },
    { text: 'இப்போது இலவசமாக பதிவு செய்யுங்கள்', dir: 'ltr', language: 'Tamil' },
    { text: 'Registrer deg gratis nå', dir: 'ltr', language: 'Norwegian' },
    { text: 'Jisajili bure sasa', dir: 'ltr', language: 'Swahili' },
    { text: 'Tilmeld dig gratis nu', dir: 'ltr', language: 'Danish' },
    { text: 'הירשמו בחינם עכשיו', dir: 'rtl', language: 'Hebrew' },
    { text: 'همین الان رایگان ثبت‌نام کنید', dir: 'rtl', language: 'Persian' },
    { text: 'Εγγραφείτε δωρεάν τώρα', dir: 'ltr', language: 'Greek' },
    { text: 'ابھی مفت سائن اپ کریں', dir: 'rtl', language: 'Urdu' },
    { text: 'Zaregistrujte se zdarma', dir: 'ltr', language: 'Czech' },
    { text: 'Mag-sign up nang libre ngayon', dir: 'ltr', language: 'Filipino' },
    { text: 'Şimdi ücretsiz kaydol', dir: 'ltr', language: 'Turkish' }
  ];

  const pauseMs = 3500;
  const flipMs = 650;

  let flipped = $state(false);
  let questionIndex = $state(0);
  let celebrate = $state(0);

  function showCardA() {
    flipped = false;
  }

  function celebrateCorrect() {
    celebrate += 1;
  }

  /** Each face keeps its own content — updated only while that face is hidden. */
  let cardA = $state(phrases[1]);
  let cardB = $state({
    question: phrases[0],
    hintLanguage: phrases[2].language
  });

  function phraseAt(offset: number): Phrase {
    return phrases[(questionIndex + offset) % phrases.length];
  }

  onMount(() => {
    if (!browser) return;

    let timeoutId: number | undefined;
    let active = true;

    function wait(ms: number): Promise<void> {
      return new Promise((resolve) => {
        timeoutId = window.setTimeout(resolve, ms);
      });
    }

    async function runCycle() {
      while (active) {
        // Card A visible
        showCardA();
        celebrateCorrect();
        await wait(pauseMs);
        if (!active) break;

        // Flip to Card B (content already prepared)
        flipped = true;
        await wait(flipMs);
        if (!active) break;
        await wait(pauseMs);
        if (!active) break;

        // Card B visible — update hidden Card A, then flip back
        cardA = phraseAt(2);
        questionIndex = (questionIndex + 1) % phrases.length;
        showCardA();
        await wait(flipMs);
        celebrateCorrect();
        if (!active) break;

        // Card A visible — update hidden Card B for the next flip
        cardB = {
          question: phraseAt(0),
          hintLanguage: phraseAt(2).language
        };
      }
    }

    void runCycle();

    return () => {
      active = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  });
</script>

<div class="home-flashcard" aria-live="polite" aria-atomic="true">
  <div class="home-flashcard__shadow" class:home-flashcard__shadow-active={flipped}></div>

  <div class="home-flashcard__scene">
    <div class="home-flashcard__card" class:home-flashcard__card--flipped={flipped}>
      <!-- Card A: answer (shown first) -->
      <div class="home-flashcard__side home-flashcard__side--a">
        <p class="home-flashcard__text" dir={cardA.dir}>{cardA.text}</p>
        {#key celebrate}
          <div class="home-flashcard__result home-flashcard__result--celebrate">
            <span class="home-flashcard__sparkle home-flashcard__sparkle--1" aria-hidden="true"
              >✦</span
            >
            <span class="home-flashcard__sparkle home-flashcard__sparkle--2" aria-hidden="true"
              >✦</span
            >
            <span class="home-flashcard__sparkle home-flashcard__sparkle--3" aria-hidden="true"
              >✦</span
            >
            <span class="home-flashcard__correct">Correct</span>
            <span class="home-flashcard__next">Next card</span>
          </div>
        {/key}
      </div>

      <!-- Card B: question (shown second) -->
      <div class="home-flashcard__side home-flashcard__side--b">
        <p class="home-flashcard__prompt">What is</p>
        <p class="home-flashcard__text" dir={cardB.question.dir}>{cardB.question.text}</p>
        <p class="home-flashcard__hint">In {cardB.hintLanguage}</p>
      </div>
    </div>
  </div>
</div>
