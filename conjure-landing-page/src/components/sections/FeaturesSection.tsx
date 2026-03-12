// Server Component — no 'use client' directive
import { FEATURES } from '@/lib/content'

const FEATURE_LIST = [
  { key: 'component_assembly', TITLE: FEATURES.COMPONENT_ASSEMBLY.TITLE, OUTCOME: FEATURES.COMPONENT_ASSEMBLY.OUTCOME, moment: 2 },
  { key: 'character_extraction', TITLE: FEATURES.CHARACTER_EXTRACTION.TITLE, OUTCOME: FEATURES.CHARACTER_EXTRACTION.OUTCOME, moment: 3 },
  { key: 'camera_presets', TITLE: FEATURES.CAMERA_PRESETS.TITLE, OUTCOME: FEATURES.CAMERA_PRESETS.OUTCOME, moment: 4 },
  { key: 'pose_sheets', TITLE: FEATURES.POSE_SHEETS.TITLE, OUTCOME: FEATURES.POSE_SHEETS.OUTCOME, moment: 5 },
  { key: 'slides_export', TITLE: FEATURES.SLIDES_EXPORT.TITLE, OUTCOME: FEATURES.SLIDES_EXPORT.OUTCOME, moment: null },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <h2 className="text-foreground font-sans font-medium tracking-tight text-3xl text-center mb-16">
        What you get
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 list-none p-0">
        {FEATURE_LIST.map((feature, index) => (
          <li
            key={feature.key}
            className={`glass-surface rounded-xl p-8 flex flex-col gap-4${index === 4 ? ' md:col-span-2 max-w-sm mx-auto w-full' : ''}`}
          >
            {/* Screenshot placeholder per FEAT-06 */}
            {feature.moment !== null && (
              <div
                className="w-full aspect-video rounded-lg bg-secondary flex items-center justify-center"
                data-placeholder={`SCREENSHOT_REQUIRED_MOMENT_${feature.moment}`}
                aria-hidden="true"
              >
                <span className="text-muted-foreground text-xs font-mono">
                  {`<!-- SCREENSHOT_REQUIRED: MOMENT_${feature.moment} -->`}
                </span>
              </div>
            )}
            <h3 className="text-foreground font-sans font-medium text-lg">
              {feature.TITLE}
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              {feature.OUTCOME}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
