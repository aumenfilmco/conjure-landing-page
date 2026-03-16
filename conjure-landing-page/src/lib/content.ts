// src/lib/content.ts
// Single source of truth for all public-facing copy.
// Sourced verbatim from LANDING-PAGE-BRIEF.md — do NOT edit copy here without
// updating the brief. No component file should contain inline marketing copy.

// ─── Hero ────────────────────────────────────────────────────────────────────
export const HERO = {
  HEADLINE:    'Direct the shot. Not the prompt.',
  SUBHEAD:     'Conjure assembles every prompt from your script — characters, locations, camera packages — so you can stay in creative mode. Script to branded storyboard deck in an afternoon.',
  BADGE:       'Commercial previs pipeline',
  CTA_PRIMARY: 'Join the waitlist',
  CTA_URL:     '#waitlist',
  CTA_WAITLIST: 'Join the waitlist',
  CTA_WAITLIST_URL: '#waitlist',
} as const

// ─── How It Works ────────────────────────────────────────────────────────────
// Per HOW-01 and HOW-02 — Director vocabulary, 3 steps
export const HOW_IT_WORKS = {
  STEPS: [
    {
      number: 1,
      TITLE:  'Extract from the script',
      BODY:   'Paste your script. Conjure reads it and returns named characters with descriptions, wardrobe, and notable traits — pulled directly from the text in under a minute.',
    },
    {
      number: 2,
      TITLE:  'Assemble each shot',
      BODY:   'Pick the character, location, and camera package for each shot — or let Conjure pick them for you. The generation prompt builds itself; no typing the same camera spec twice.',
    },
    {
      number: 3,
      TITLE:  'Export to Google Slides',
      BODY:   'Approved boards go to Google Slides in one click. Sign in with Google, hit export, and a branded deck lands in Drive — a traditional storyboard grid with captions and dialogue under each frame, ready to send.',
    },
  ],
} as const

// ─── Features ────────────────────────────────────────────────────────────────
export const FEATURES = {
  SHOT_EXTRACTION: {
    TITLE:   'Shot Extraction',
    OUTCOME: 'Paste the script. Conjure reads it scene by scene and builds a shot list — setups, coverage logic, framing decisions derived from proven composition frameworks. Establishing, coverage, close-up, cutaway: every choice justified by what the scene actually needs. You start the board with a draft, not a blank page.',
  },
  CHARACTER_INTELLIGENCE: {
    TITLE:   'Character Intelligence',
    OUTCOME: 'Every character briefed and locked before shot one. Conjure reads the script and pulls names, descriptions, wardrobe, and notable traits — no manual notes, no rereading. Then generates a pose sheet: front, three-quarter, profile. Shot 1 and shot 28 look like the same person.',
  },
  LOCATION_INTELLIGENCE: {
    TITLE:   'Location Intelligence',
    OUTCOME: 'Every space your scenes live in, extracted and documented. Conjure pulls locations from the script and generates visual reference sheets so the beach at dawn in shot 4 matches the beach at dawn in shot 19. No mismatched backgrounds. No drift between setups.',
  },
  COMPONENT_ASSEMBLY: {
    TITLE:   'Component Assembly',
    OUTCOME: 'Build once, reuse everywhere. Characters, locations, camera packages — stored as components and assembled per shot automatically. A 30-shot board without typing the same description twice. The repetitive work is gone; the creative decisions stay.',
  },
  CAMERA_PRESETS: {
    TITLE:   'Camera Package Presets',
    OUTCOME: 'Lock the look once. RED Komodo, 35mm anamorphic, Glimmerglass — entered once per project, applied to every shot. The camera spec is never a question. Your attention stays on the frame.',
  },
  SLIDES_EXPORT: {
    TITLE:   'One-Click Deck Export',
    OUTCOME: 'Approved boards to a shareable link in one click. Sign in with Google, hit export — a branded deck lands in Drive. A traditional storyboard grid with captions and dialogue under each frame. No downloading images. No assembly.',
  },
} as const

// ─── Pricing ─────────────────────────────────────────────────────────────────
// Exact values from LANDING-PAGE-BRIEF.md Section 6.1
export const PRICING = {
  TIERS: [
    {
      id:              'scout',
      name:            'Scout',
      monthlyPrice:    39,
      annualPrice:     390,
      annualMonthly:   32,
      credits:         150,
      projects:        '~2',
      seats:           1,
    },
    {
      id:              'director',
      name:            'Director',
      monthlyPrice:    59,
      annualPrice:     590,
      annualMonthly:   49,
      credits:         250,
      projects:        '~4',
      seats:           1,
    },
    {
      id:              'producer',
      name:            'Producer',
      monthlyPrice:    89,
      annualPrice:     890,
      annualMonthly:   74,
      credits:         380,
      projects:        '~6',
      seats:           2,
    },
    {
      id:              'studio',
      name:            'Studio',
      monthlyPrice:    129,
      annualPrice:     1290,
      annualMonthly:   108,
      credits:         650,
      projects:        '~10',
      seats:           3,
      seatsLabel:      'Up to 3',
    },
  ],
  TRIAL_CTA:      'Join the waitlist',
  TRIAL_URL:      '#waitlist',
  TRIAL_DURATION: '7-day trial',
  TRIAL_NOTE:     'No card required.',
  BILLING_NOTE:   'per month billed annually',
} as const

// ─── Waitlist ─────────────────────────────────────────────────────────────────
export const WAITLIST = {
  HEADING:           'Get early access',
  SUBHEAD:           'Be first to know when Conjure opens. One email when it does.',
  SUBMIT_LABEL:      'Join the waitlist',
  NAME_PLACEHOLDER:  'Your name (optional)',
  EMAIL_PLACEHOLDER: 'Your email',
  SUCCESS_MESSAGE:   'You\'re on the list. We\'ll reach out when access opens.',
  ERROR_MESSAGE:     'Something went wrong. Try again or email us at hello@conjurestudio.app.',
  ENDPOINT:          '/api/waitlist',
} as const

// ─── FAQ ─────────────────────────────────────────────────────────────────────
// Questions per FAQ-01 — Director/CD objections, Director vocabulary
export const FAQ = {
  ITEMS: [
    {
      question: 'Do I need to know how to draw?',
      answer:   'No. You pick characters, locations, and a camera package — Conjure generates the board. Directors who have never touched an illustration tool use it end-to-end. The output looks like a real previs deck because it is one.',
    },
    {
      question: 'What happens to my script?',
      answer:   'Your script is processed to extract character names and descriptions. It is not stored beyond your session and is never used to train any model. You own the output.',
    },
    {
      question: 'How is this different from just using Midjourney?',
      answer:   'Midjourney generates one image. Conjure generates a full shot list where the same character looks the same in shot 1 and shot 28 — and exports directly to a Google Slides deck you can send. The difference is a consistent board versus a folder of images to reassemble manually.',
    },
  ],
} as const

// ─── Social Proof ─────────────────────────────────────────────────────────────
// Section layout ready — testimonial content pending delivery
// See LANDING-PAGE-BRIEF.md Section 7.4
export const SOCIAL_PROOF = {
  // <!-- TESTIMONIAL_REQUIRED -->
  // Placeholder until beta user testimonial is delivered
  SECTION_HEADING: 'Directors use it on real spots',
  TESTIMONIAL: null, // Fill when: { quote, name, title, agency, result }
} as const
