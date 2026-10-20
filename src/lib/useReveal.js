import { useEffect, useRef, useState } from 'react'
import { ANIM_STYLES } from './style'

/**
 * Hook to manage reveal / entrance animations for elements (both in preview and published site).
 * Supports triggers:
 *   - 'scroll' (IntersectionObserver: animates when scrolled into view)
 *   - 'load'   (Mount timer: animates smoothly on initial load)
 *
 * Once the entrance animation finishes, styles are cleanly unpinned so that
 * button hover, active, and focus micro-interactions are crisp and responsive.
 */
export function useReveal(anim) {
  const ref = useRef(null)
  const inactive = !anim || !anim.type || anim.type === 'none'
  const [shown, setShown] = useState(Boolean(inactive))
  const [animDone, setAnimDone] = useState(Boolean(inactive))

  // Trigger state changes: false -> true
  useEffect(() => {
    if (inactive) {
      setShown(true)
      setAnimDone(true)
      return
    }

    setShown(false)
    setAnimDone(false)

    if (anim.trigger === 'load') {
      const timer = setTimeout(() => {
        setShown(true)
      }, 50)
      return () => clearTimeout(timer)
    }

    // Default trigger: 'scroll'
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [inactive, anim?.type, anim?.trigger])

  // Mark animation completed after duration + delay
  useEffect(() => {
    if (!shown || inactive) return
    const dur = Number(anim?.duration) || 0.6
    const delay = Number(anim?.delay) || 0
    const totalMs = Math.round((dur + delay) * 1000) + 70
    const timer = setTimeout(() => {
      setAnimDone(true)
    }, totalMs)
    return () => clearTimeout(timer)
  }, [shown, inactive, anim?.duration, anim?.delay])

  if (inactive) return { ref, style: {}, shown: true, animDone: true }

  const hidden = ANIM_STYLES[anim.type] || null
  if (!hidden) return { ref, style: {}, shown: true, animDone: true }

  const dur = Number(anim.duration) || 0.6
  const delay = Number(anim.delay) || 0
  const easing = anim.easing || 'ease-out'

  const style = animDone
    ? {}
    : {
        ...(shown ? {} : hidden),
        transition: `opacity ${dur}s ${easing} ${delay}s, transform ${dur}s ${easing} ${delay}s`,
      }

  return { ref, style, shown, animDone }
}
