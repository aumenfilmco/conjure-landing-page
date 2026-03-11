// src/lib/content.ts
// Single source of truth for all public-facing copy.
// Sourced verbatim from LANDING-PAGE-BRIEF.md — do NOT edit copy here without
// updating the brief. No component file should contain inline marketing copy.

// ─── Hero ────────────────────────────────────────────────────────────────────
export const HERO = {
  HEADLINE:    'Your first 20-shot board in an afternoon. Your second one faster.',
  SUBHEAD:     'Script to Google Slides deck — characters extracted, shots assembled, deck exported. No retyping. No reformatting. No missing person in shot 12.',
  CTA_PRIMARY: 'Start free — no credit card',
  CTA_URL:     'https://conjurestudio.app/auth/signup',
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
      BODY:   'Pick the character, location, and camera package for each shot. The generation prompt builds itself — no typing the same camera spec twice.',
    },
    {
      number: 3,
      TITLE:  'Export to Google Slides',
      BODY:   'Approved boards go to Google Slides in one click. Sign in with Google, hit export, and a branded deck lands in Drive — one slide per approved board, ready to send.',
    },
  ],
} as const

// ─── Features ────────────────────────────────────────────────────────────────
// User outcome copy from LANDING-PAGE-BRIEF.md Section 2 — verbatim
export const FEATURES = {
  COMPONENT_ASSEMBLY: {
    TITLE:   'Component Assembly',
    OUTCOME: 'Get through a 30-shot board without typing the same character description twice. Every shot pulls from stored components — characters, locations, camera packages — assembled automatically. The creative work is picking the components; the repetitive assembly is gone.',
  },
  CHARACTER_EXTRACTION: {
    TITLE:   'Character Extraction',
    OUTCOME: 'Every character is briefed and ready before the first shot — without reading through the script yourself. Paste the script, hit extract, and get named characters with physical descriptions, wardrobe, and notable traits pulled directly from the text in under a minute.',
  },
  CAMERA_PRESETS: {
    TITLE:   'Camera Package Presets',
    OUTCOME: 'Set the camera spec once and every shot on the board uses it. RED Komodo, 35mm anamorphic, Glimmerglass — entered once per project, never per shot. The look is locked; the director\'s attention stays on the frame.',
  },
  POSE_SHEETS: {
    TITLE:   'Character Pose Sheets',
    OUTCOME: 'The same person looks like the same person in shot 1 and shot 28. Generate a pose sheet for each character — front, three-quarter, profile — and that reference holds character appearance consistent across the full board without manual description tweaking between shots.',
  },
  SLIDES_EXPORT: {
    TITLE:   'Google Slides Export',
    OUTCOME: 'Go from approved boards to a shareable deck link in one click. Sign in with Google, hit export, and a branded presentation lands in Google Drive — one slide per approved board, ready to send. No Slides tab. No downloading images. No assembly.',
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
  TRIAL_CTA:      'Start free — no credit card',
  TRIAL_URL:      'https://conjurestudio.app/auth/signup',
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
  ENDPOINT:          'https://conjurestudio.app/api/waitlist',
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
