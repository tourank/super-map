import { describe, it, expect } from 'vitest'
import { 
  needsDetailedSearch, 
  getRelevantAmenities, 
  formatAmenityData,
  AMENITY_KEYWORDS
} from '../amenityDetection'

describe('amenityDetection', () => {
  describe('needsDetailedSearch', () => {
    it('returns true when query contains amenity keywords', () => {
      expect(needsDetailedSearch('restaurants with outdoor seating')).toBe(true)
      expect(needsDetailedSearch('dog-friendly cafes')).toBe(true)
      expect(needsDetailedSearch('places with live music')).toBe(true)
      expect(needsDetailedSearch('coffee shops')).toBe(true)
    })

    it('returns false when query contains no amenity keywords', () => {
      expect(needsDetailedSearch('restaurants near me')).toBe(false)
      expect(needsDetailedSearch('Italian food')).toBe(false)
      expect(needsDetailedSearch('shopping mall')).toBe(false)
    })

    it('is case insensitive', () => {
      expect(needsDetailedSearch('DOG-FRIENDLY restaurants')).toBe(true)
      expect(needsDetailedSearch('Outdoor Seating')).toBe(true)
    })
  })

  describe('getRelevantAmenities', () => {
    it('returns correct amenities for single keyword', () => {
      expect(getRelevantAmenities('dog-friendly cafes')).toContain('dogs')
      expect(getRelevantAmenities('outdoor seating restaurants')).toContain('outdoorSeating')
      expect(getRelevantAmenities('live music venues')).toContain('liveMusic')
    })

    it('returns multiple amenities for multiple keywords', () => {
      const amenities = getRelevantAmenities('dog-friendly restaurants with outdoor seating and live music')
      expect(amenities).toContain('dogs')
      expect(amenities).toContain('outdoorSeating')
      expect(amenities).toContain('liveMusic')
    })

    it('does not duplicate amenities', () => {
      const amenities = getRelevantAmenities('dog and dogs and pet-friendly')
      const dogCount = amenities.filter(a => a === 'dogs').length
      expect(dogCount).toBe(1)
    })

    it('returns empty array when no amenities found', () => {
      expect(getRelevantAmenities('Italian restaurants')).toEqual([])
    })
  })

  describe('formatAmenityData', () => {
    it('formats boolean amenity data correctly', () => {
      const place = {
        dogs: true,
        outdoorSeating: false,
        liveMusic: true
      }
      const relevantAmenities = ['dogs', 'outdoorSeating', 'liveMusic']
      
      const result = formatAmenityData(place, relevantAmenities)
      expect(result).toBe('dogs: Yes, outdoor seating: No, live music: Yes')
    })

    it('formats string amenity data correctly', () => {
      const place = {
        parkingOptions: 'Free parking available',
        restroom: 'Yes'
      }
      const relevantAmenities = ['parkingOptions', 'restroom']
      
      const result = formatAmenityData(place, relevantAmenities)
      expect(result).toBe('parking options: Free parking available, restroom: Yes')
    })

    it('skips undefined and null values', () => {
      const place = {
        dogs: true,
        outdoorSeating: null,
        liveMusic: undefined,
        servesCoffee: false
      }
      const relevantAmenities = ['dogs', 'outdoorSeating', 'liveMusic', 'servesCoffee']
      
      const result = formatAmenityData(place, relevantAmenities)
      expect(result).toBe('dogs: Yes, serves coffee: No')
    })

    it('handles camelCase to readable format conversion', () => {
      const place = {
        goodForWatchingSports: true,
        servesVegetarianFood: false
      }
      const relevantAmenities = ['goodForWatchingSports', 'servesVegetarianFood']
      
      const result = formatAmenityData(place, relevantAmenities)
      expect(result).toBe('good for watching sports: Yes, serves vegetarian food: No')
    })
  })

  describe('AMENITY_KEYWORDS', () => {
    it('contains expected categories', () => {
      expect(AMENITY_KEYWORDS).toHaveProperty('dogs')
      expect(AMENITY_KEYWORDS).toHaveProperty('outdoorSeating')
      expect(AMENITY_KEYWORDS).toHaveProperty('liveMusic')
      expect(AMENITY_KEYWORDS).toHaveProperty('servesCoffee')
    })

    it('has arrays of keywords for each category', () => {
      expect(Array.isArray(AMENITY_KEYWORDS.dogs)).toBe(true)
      expect(AMENITY_KEYWORDS.dogs.length).toBeGreaterThan(0)
      expect(AMENITY_KEYWORDS.dogs).toContain('dog')
      expect(AMENITY_KEYWORDS.dogs).toContain('pet-friendly')
    })
  })
})