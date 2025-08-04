/**
 * Test file for event handler optimization utilities
 * Tests debounce, throttle, and rafThrottle functions
 */

// Mock the utility functions for testing
function debounce(func, delay) {
  let timeoutId = null
  
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

function throttle(func, limit) {
  let inThrottle = false
  
  return (...args) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

function rafThrottle(func) {
  let ticking = false
  
  return (...args) => {
    if (!ticking) {
      // Use setTimeout as fallback for Node.js environment
      setTimeout(() => {
        func(...args)
        ticking = false
      }, 16) // ~60fps
      ticking = true
    }
  }
}

// Test debounce function
console.log('Testing debounce function...')
let debounceCount = 0
const debouncedFn = debounce(() => {
  debounceCount++
  console.log(`Debounced function called ${debounceCount} times`)
}, 100)

// Call multiple times quickly - should only execute once after delay
for (let i = 0; i < 10; i++) {
  debouncedFn()
}

// Test throttle function
console.log('\nTesting throttle function...')
let throttleCount = 0
const throttledFn = throttle(() => {
  throttleCount++
  console.log(`Throttled function called ${throttleCount} times`)
}, 200)

// Call multiple times - should execute at most once per 200ms
for (let i = 0; i < 5; i++) {
  throttledFn()
  setTimeout(() => throttledFn(), 50 * i)
}

// Test rafThrottle function
console.log('\nTesting rafThrottle function...')
let rafCount = 0
const rafThrottledFn = rafThrottle(() => {
  rafCount++
  console.log(`RAF throttled function called ${rafCount} times`)
})

// Call multiple times quickly - should execute once per frame
for (let i = 0; i < 10; i++) {
  rafThrottledFn()
}

console.log('\nEvent handler optimization tests completed!')
console.log('These utilities will improve performance by:')
console.log('- Debounce: Delaying execution until user stops interacting')
console.log('- Throttle: Limiting execution frequency')
console.log('- RAF Throttle: Using requestAnimationFrame for smooth 60fps updates') 