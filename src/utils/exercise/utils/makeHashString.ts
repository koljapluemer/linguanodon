/**
 * Simple hash function for generating readable, unique-enough strings for UIDs.
 */
export function makeHashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }