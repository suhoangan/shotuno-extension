"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

/** Matches `size-4` thumb — keep in sync with SliderThumb className */
const THUMB_SIZE_PX = 16

type SliderProps = SliderPrimitive.Root.Props & {
  /** When set, renders tick marks every `marksStep` units along the track */
  marksStep?: number
}

function markCenterPx(index: number, count: number, trackWidth: number) {
  if (count <= 1) return trackWidth / 2
  const ratio = index / (count - 1)
  return THUMB_SIZE_PX / 2 + ratio * (trackWidth - THUMB_SIZE_PX)
}

function SliderMarks({
  min,
  max,
  step,
}: {
  min: number
  max: number
  step: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(0)
  const count = Math.floor((max - min) / step) + 1

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => setTrackWidth(el.clientWidth)
    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
    >
      {trackWidth > 0 &&
        Array.from({ length: count }, (_, index) => (
          <span
            key={min + index * step}
            className="absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/30"
            style={{ left: markCenterPx(index, count, trackWidth) }}
          />
        ))}
    </div>
  )
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  marksStep,
  step,
  ...props
}: SliderProps) {
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min, max]

  const tickStep = marksStep ?? step

  return (
    <SliderPrimitive.Root
      className={cn("data-horizontal:w-full data-vertical:h-full", className)}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      step={step}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex h-8 w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative z-10 h-2.5 w-full overflow-visible rounded-full border border-border bg-muted/80 shadow-inner select-none data-vertical:h-full data-vertical:w-2.5"
        >
          {tickStep ? <SliderMarks min={min} max={max} step={tickStep} /> : null}
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="relative z-10 h-full rounded-full bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            className="absolute top-1/2 z-20 block size-4 shrink-0 rounded-full border-2 border-background bg-primary shadow-md ring-1 ring-primary/30 transition-[box-shadow,transform] select-none hover:scale-110 hover:ring-4 hover:ring-primary/20 focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-hidden active:scale-105 disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
