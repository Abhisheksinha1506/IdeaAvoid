// Data loader for combined_ideas.json
export async function loadIdeas() {
  try {
    // Add cache busting to ensure fresh data
    const timestamp = new Date().getTime()
    const response = await fetch(`/combined_ideas.json?t=${timestamp}`, {
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    console.log('✅ Successfully loaded JSON data:', {
      totalIdeas: data.metadata?.uniqueIdeas || data.ideas?.length || 0,
      generated: data.metadata?.generated,
      timestamp: new Date().toISOString()
    })
    
    // Helper function to clean and format pain points
    function cleanPainPoint(painPoint) {
      if (!painPoint || typeof painPoint !== 'string') return ''
      
      let cleaned = painPoint.trim()
      
      // Remove leading bullet points, dashes, or special characters
      cleaned = cleaned.replace(/^[•\-\*\u2022\u25CF\u25E6\u2043]\s*/, '')
      cleaned = cleaned.replace(/^[•\-\*\u2022\u25CF\u25E6\u2043]\s*/, '') // Remove double bullets
      
      // Remove "•" if it appears at the start
      cleaned = cleaned.replace(/^•\s*/, '')
      
      // Capitalize first letter
      if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
      }
      
      return cleaned
    }
    
    // Helper function to split concatenated tags
    function splitConcatenatedTag(tag) {
      if (!tag || typeof tag !== 'string') return []
      
      const cleaned = tag.trim()
      if (cleaned.length === 0) return []
      
      // If tag already has spaces or separators, split by them
      if (/[\s,\-_]/.test(cleaned)) {
        return cleaned.split(/[\s,\-_]+/).map(t => t.trim()).filter(t => t.length > 0)
      }
      
      // Check if it's a concatenated tag
      // Pattern 1: lowercaseLetter followed by uppercaseLetter (camelCase)
      // Pattern 2: Multiple uppercase letters followed by lowercase (PascalCase or acronyms)
      // Pattern 3: All lowercase but very long (likely concatenated)
      // Pattern 4: Starts with capital, has lowercase, and is long (likely concatenated words)
      // Pattern 5: All lowercase but contains common word patterns (likely concatenated)
      const hasCamelCase = /[a-z][A-Z]/.test(cleaned)
      const hasPascalCase = /[A-Z][a-z]/.test(cleaned) && /[A-Z]{2,}/.test(cleaned)
      const isLongLowercase = cleaned === cleaned.toLowerCase() && cleaned.length > 12
      const isLongMixedCase = /^[A-Z][a-z]+/.test(cleaned) && cleaned.length > 15 && !/[a-z][A-Z]/.test(cleaned)
      
      // Check if tag contains common word patterns (likely concatenated)
      // This works for both all-lowercase and capitalized tags
      const lowerTag = cleaned.toLowerCase()
      const commonWords = [
        'amazon', 'seller', 'analysis', 'analytics', 'ai', 'and', 'hiking', 'animation', 'career',
        'testing', 'mock', 'api', 'web', 'app', 'dev', 'developer', 'design',
        'automation', 'platform', 'software', 'mobile', 'cloud', 'data', 'ml', 'ui', 'ux', 'saas',
        'marketing', 'social', 'media', 'content', 'management', 'business',
        'finance', 'health', 'education', 'learning', 'training', 'course',
        'affiliate', 'freelance', 'writer', 'language', 'engineering', 'student',
        'college', 'natural', 'bodybuilding', 'career', 'question', 'programming',
        'financial', 'planning', 'influencer', 'instagram', 'commercial', 'real',
        'estate', 'artificial', 'intelligence', 'cooking', 'beginner', 'digital',
        'music', 'maker', 'manager', 'service', 'product', 'customer', 'support',
        'tracking', 'recommendation', 'personalized', 'matching', 'travel',
        'productivity', 'wellness', 'gaming', 'job', 'engine', 'tech', 'building',
        'creation', 'video', 'audio', 'communication', 'networking', 'community',
        'seller', 'buyer', 'market', 'store', 'shop', 'online', 'ecommerce', 'commerce'
      ]
      
      // Find all common words in the tag
      let foundWords = []
      for (const word of commonWords.sort((a, b) => b.length - a.length)) {
        let searchIndex = 0
        while (true) {
          const index = lowerTag.indexOf(word, searchIndex)
          if (index === -1) break
          
          // Check if it's a valid word boundary
          const beforeChar = index > 0 ? lowerTag[index - 1] : ''
          const afterChar = index + word.length < lowerTag.length ? lowerTag[index + word.length] : ''
          
          // Valid if: start of string OR after non-letter OR after another matched word
          // AND: end of string OR before non-letter OR before another matched word
          const isValidStart = index === 0 || !/[a-z]/.test(beforeChar) || 
                                foundWords.some(fw => fw.index + fw.word.length === index)
          const isValidEnd = index + word.length === lowerTag.length || !/[a-z]/.test(afterChar) ||
                             foundWords.some(fw => fw.index === index + word.length)
          
          if (isValidStart && isValidEnd) {
            foundWords.push({ word, index })
            searchIndex = index + word.length
          } else {
            searchIndex = index + 1
          }
        }
      }
      
      // Remove overlapping matches (keep longest)
      foundWords.sort((a, b) => a.index - b.index)
      const nonOverlapping = []
      for (let i = 0; i < foundWords.length; i++) {
        const current = foundWords[i]
        const overlaps = nonOverlapping.some(existing => {
          const existingEnd = existing.index + existing.word.length
          const currentEnd = current.index + current.word.length
          return (current.index < existingEnd && currentEnd > existing.index)
        })
        if (!overlaps) {
          nonOverlapping.push(current)
        }
      }
      foundWords = nonOverlapping
      
      const isConcatenated = foundWords.length > 1 && cleaned.length > 8
      
      // If it's a short single word without boundaries, return as is
      if (!hasCamelCase && !hasPascalCase && !isLongLowercase && !isLongMixedCase && !isConcatenated && cleaned.length < 15) {
        return [formatTag(cleaned)]
      }
      
      // Handle concatenated tags (both all-lowercase and capitalized)
      if (isConcatenated && foundWords.length > 1) {
        foundWords.sort((a, b) => a.index - b.index)
        const words = []
        let start = 0
        
        foundWords.forEach(({ word, index }) => {
          if (index > start) {
            const beforeWord = cleaned.substring(start, index)
            if (beforeWord.length > 2) {
              words.push(beforeWord)
            }
          }
          words.push(cleaned.substring(index, index + word.length))
          start = index + word.length
        })
        
        if (start < cleaned.length) {
          const afterWord = cleaned.substring(start)
          if (afterWord.length > 2) {
            words.push(afterWord)
          }
        }
        
        if (words.length > 1) {
          return words.map(formatTag)
        }
      }
      
      // For long mixed case tags without camelCase boundaries, try to split by detecting word boundaries
      if (isLongMixedCase) {
        // Try to detect where words might end (look for common word endings followed by new word starts)
        // This is a heuristic: look for patterns like "ing", "er", "ed" followed by lowercase that might be a new word
        const wordBoundaries = []
        const lowerTag = cleaned.toLowerCase()
        
        // Common word endings that might indicate a word boundary
        const endings = ['ing', 'er', 'ed', 'ly', 'tion', 'sion', 'ment', 'ness', 'ity']
        endings.forEach(ending => {
          const regex = new RegExp(ending + '([a-z])', 'gi')
          let match
          while ((match = regex.exec(cleaned)) !== null) {
            const pos = match.index + ending.length
            if (pos > 3 && pos < cleaned.length - 3) {
              wordBoundaries.push(pos)
            }
          }
        })
        
        if (wordBoundaries.length > 0) {
          // Sort and remove duplicates
          const sortedBoundaries = [...new Set(wordBoundaries)].sort((a, b) => a - b)
          const words = []
          let start = 0
          
          sortedBoundaries.forEach(boundary => {
            if (boundary > start + 3) { // Minimum word length
              words.push(cleaned.substring(start, boundary))
              start = boundary
            }
          })
          if (start < cleaned.length) {
            words.push(cleaned.substring(start))
          }
          
          if (words.length > 1) {
            return words.map(formatTag)
          }
        }
      }
      
      // Split by capital letters (camelCase or PascalCase)
      let words = cleaned
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital after lowercase
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // Add space between multiple capitals and following word
        .replace(/([a-z])([A-Z][a-z])/g, '$1 $2') // Additional camelCase handling
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 0)
      
      // If still no split and it's long, try to split by common word patterns
      if (words.length === 1 && cleaned.length > 12) {
        // Expanded list of common tech and business terms
        const commonTerms = [
          'testing', 'mock', 'api', 'web', 'app', 'dev', 'developer', 'design',
          'automation', 'analytics', 'platform', 'software', 'mobile', 'cloud',
          'data', 'ai', 'ml', 'ui', 'ux', 'saas', 'aws', 'azure', 'gcp',
          'marketing', 'social', 'media', 'content', 'management', 'business',
          'finance', 'health', 'education', 'learning', 'training', 'course',
          'affiliate', 'freelance', 'writer', 'language', 'engineering', 'student',
          'college', 'natural', 'bodybuilding', 'career', 'question', 'programming',
          'financial', 'planning', 'influencer', 'instagram', 'commercial', 'real',
          'estate', 'artificial', 'intelligence', 'cooking', 'beginner', 'digital',
          'music', 'maker', 'manager', 'service', 'product', 'customer', 'support',
          'tracking', 'recommendation', 'personalized', 'matching', 'travel',
          'productivity', 'wellness', 'gaming', 'job', 'engine', 'tech', 'building',
          'creation', 'video', 'audio', 'communication', 'networking', 'community'
        ]
        
        let lowerTag = cleaned.toLowerCase()
        const foundTerms = []
        let lastIndex = 0
        
        // Sort terms by length (longest first) to avoid partial matches
        const sortedTerms = [...commonTerms].sort((a, b) => b.length - a.length)
        
        for (const term of sortedTerms) {
          const index = lowerTag.indexOf(term, lastIndex)
          if (index !== -1) {
            // Check if this is a valid word boundary (not part of another word)
            const beforeChar = index > 0 ? lowerTag[index - 1] : ''
            const afterChar = index + term.length < lowerTag.length ? lowerTag[index + term.length] : ''
            
            // Valid if: start of string, or after non-letter, or after another matched term
            // And: end of string, or before non-letter, or before another matched term
            const isValidStart = index === 0 || !/[a-z]/.test(beforeChar) || foundTerms.some(ft => ft.index + ft.term.length === index)
            const isValidEnd = index + term.length === lowerTag.length || !/[a-z]/.test(afterChar) || foundTerms.some(ft => ft.index === index + term.length)
            
            if (isValidStart && isValidEnd) {
              foundTerms.push({ term, index })
              lastIndex = index + term.length
            }
          }
        }
        
        // Sort found terms by index
        foundTerms.sort((a, b) => a.index - b.index)
        
        if (foundTerms.length > 1) {
          words = []
          let prevIndex = 0
          foundTerms.forEach(({ term, index }) => {
            if (index > prevIndex) {
              const beforeWord = cleaned.substring(prevIndex, index)
              if (beforeWord.length > 2) {
                words.push(beforeWord)
              }
            }
            words.push(cleaned.substring(index, index + term.length))
            prevIndex = index + term.length
          })
          if (prevIndex < cleaned.length) {
            const afterWord = cleaned.substring(prevIndex)
            if (afterWord.length > 2) {
              words.push(afterWord)
            }
          }
          words = words.filter(w => w.length > 0)
        }
      }
      
      return words.map(formatTag)
    }
    
    // Helper function to format a single tag
    function formatTag(tag) {
      if (!tag || typeof tag !== 'string') return ''
      
      let formatted = tag.trim()
      
      // Remove separator lines and invalid tags
      if (formatted.match(/^[=\-_]{3,}$/) || formatted.length === 0) {
        return ''
      }
      
      // Remove special characters at start/end (but keep hyphens in the middle for compound words)
      formatted = formatted.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '')
      
      // Remove tags that are just numbers or special characters
      if (!/[a-zA-Z]/.test(formatted)) {
        return ''
      }
      
      // Handle common compound words and abbreviations
      const compoundWords = {
        'ecommerce': 'E-Commerce',
        'e-commerce': 'E-Commerce',
        'api': 'API',
        'ui': 'UI',
        'ux': 'UX',
        'ai': 'AI',
        'ml': 'ML',
        'saas': 'SaaS',
        'aws': 'AWS',
        'gcp': 'GCP',
        'crm': 'CRM',
        'erp': 'ERP',
        'iot': 'IoT',
        'vr': 'VR',
        'ar': 'AR',
        'qa': 'QA',
        'devops': 'DevOps',
        'seo': 'SEO',
        'sem': 'SEM',
        'cms': 'CMS',
        'sdk': 'SDK',
        'ide': 'IDE'
      }
      
      const lowerFormatted = formatted.toLowerCase()
      if (compoundWords[lowerFormatted]) {
        return compoundWords[lowerFormatted]
      }
      
      // Capitalize first letter, rest lowercase (unless it's an acronym)
      if (formatted.length > 0) {
        // If all uppercase and 2-4 chars, keep as acronym
        if (formatted.length <= 4 && formatted === formatted.toUpperCase() && /^[A-Z]+$/.test(formatted)) {
          return formatted
        }
        // Handle hyphenated words (e.g., "E-Commerce", "Real-Time")
        if (formatted.includes('-')) {
          return formatted.split('-').map(word => {
            if (word.length > 0) {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            }
            return word
          }).join('-')
        }
        // Otherwise capitalize first letter
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase()
      }
      
      return formatted
    }
    
    // Helper function to clean and split tags
    function processTags(tags) {
      if (!Array.isArray(tags)) return []
      
      const processedTags = new Set()
      
      tags.forEach(tag => {
        if (!tag || typeof tag !== 'string') return
        
        // Skip invalid tags
        const trimmed = tag.trim()
        if (trimmed.length === 0) return
        if (trimmed.match(/^[=\-_]{3,}$/)) return // Skip separator lines
        if (!/[a-zA-Z]/.test(trimmed)) return // Skip tags with no letters
        
        const splitTags = splitConcatenatedTag(tag)
        splitTags.forEach(t => {
          const formatted = formatTag(t)
          if (formatted && formatted.length > 0 && formatted.length < 50) {
            // Additional validation: ensure tag has at least one letter
            if (/[a-zA-Z]/.test(formatted)) {
              processedTags.add(formatted)
            }
          }
        })
      })
      
      // Remove duplicates and sort
      const uniqueTags = Array.from(processedTags)
      
      // Additional cleanup: remove very similar tags (e.g., "Ai" and "AI")
      const normalizedTags = new Map()
      uniqueTags.forEach(tag => {
        const normalized = tag.toLowerCase()
        if (!normalizedTags.has(normalized) || tag.length < normalizedTags.get(normalized).length) {
          normalizedTags.set(normalized, tag)
        }
      })
      
      return Array.from(normalizedTags.values()).sort()
    }
    
    // Helper function to validate and normalize saturation data
    function validateSaturation(saturation, validation) {
      // If no saturation data, try to create it from validation data
      if (!saturation || typeof saturation !== 'object' || saturation === null) {
        if (validation && validation.aggregatedScore) {
          // Create saturation from validation data
          const competitorCount = validation.aggregatedScore.totalCompetitors || 0;
          return {
            level: competitorCount >= 50 ? 'high' : competitorCount >= 10 ? 'medium' : 'low',
            competitorCount: competitorCount,
            marketType: competitorCount >= 20 ? 'red ocean' : 'blue ocean',
            tam: competitorCount >= 100 ? '$1B+' : 
                 competitorCount >= 50 ? '$500M+' :
                 competitorCount >= 20 ? '$100M+' :
                 competitorCount >= 10 ? '$50M+' :
                 competitorCount > 0 ? '$10M+' : 'Unknown',
            lastVerified: validation.sources?.[0]?.lastChecked || validation.lastChecked || new Date().toISOString()
          };
        }
        return null;
      }
      
      // Get competitor count from validation if available
      const validationCompetitors = validation?.aggregatedScore?.totalCompetitors;
      const saturationCompetitors = saturation.competitorCount;
      
      // Ensure competitorCount matches validation totalCompetitors if both exist
      let competitorCount = saturationCompetitors;
      if (validationCompetitors !== undefined && validationCompetitors !== null) {
        // Prefer validation data as source of truth
        competitorCount = validationCompetitors;
      } else if (saturationCompetitors !== undefined && saturationCompetitors !== null) {
        competitorCount = saturationCompetitors;
      } else {
        competitorCount = 0;
      }
      
      // Ensure competitorCount is a valid number
      competitorCount = Math.max(0, Math.floor(Number(competitorCount) || 0));
      
      // Validate and normalize saturation level
      const validLevels = ['low', 'medium', 'high', 'unknown'];
      let level = saturation.level;
      if (!validLevels.includes(level)) {
        // Recalculate level based on competitor count
        if (competitorCount >= 50) {
          level = 'high';
        } else if (competitorCount >= 10) {
          level = 'medium';
        } else {
          level = 'low';
        }
      }
      
      // Validate market type
      const validMarketTypes = ['blue ocean', 'red ocean'];
      let marketType = saturation.marketType;
      if (!validMarketTypes.includes(marketType)) {
        // Recalculate market type based on competitor count
        marketType = competitorCount >= 20 ? 'red ocean' : 'blue ocean';
      }
      
      // Validate TAM
      let tam = saturation.tam;
      if (!tam || typeof tam !== 'string') {
        // Recalculate TAM based on competitor count
        if (competitorCount >= 100) {
          tam = '$1B+';
        } else if (competitorCount >= 50) {
          tam = '$500M+';
        } else if (competitorCount >= 20) {
          tam = '$100M+';
        } else if (competitorCount >= 10) {
          tam = '$50M+';
        } else if (competitorCount > 0) {
          tam = '$10M+';
        } else {
          tam = 'Unknown';
        }
      }
      
      // Validate lastVerified date
      let lastVerified = saturation.lastVerified;
      if (lastVerified) {
        try {
          const date = new Date(lastVerified);
          if (isNaN(date.getTime())) {
            lastVerified = new Date().toISOString();
          } else {
            lastVerified = date.toISOString();
          }
        } catch {
          lastVerified = new Date().toISOString();
        }
      } else {
        // Use validation date if available
        const validationDate = validation?.sources?.[0]?.lastChecked || validation?.lastChecked;
        if (validationDate) {
          try {
            const date = new Date(validationDate);
            if (!isNaN(date.getTime())) {
              lastVerified = date.toISOString();
            }
          } catch {}
        }
        if (!lastVerified) {
          lastVerified = new Date().toISOString();
        }
      }
      
      return {
        level,
        competitorCount,
        marketType,
        tam,
        lastVerified
      };
    }
    
    // Helper function to validate and normalize validation data
    function validateValidation(validation) {
      if (!validation || typeof validation !== 'object' || validation === null) {
        return null;
      }
      
      // Validate sources array
      const sources = Array.isArray(validation.sources) ? validation.sources : [];
      const validSources = sources.filter(source => {
        return source && typeof source === 'object' && 
               (source.source === 'internal_database' || source.source === 'google');
      });
      
      // Validate aggregatedScore
      let aggregatedScore = validation.aggregatedScore;
      if (!aggregatedScore || typeof aggregatedScore !== 'object') {
        // Calculate from sources if missing
        let totalCompetitors = 0;
        let totalSimilarity = 0;
        let similarityCount = 0;
        let confidence = 0;
        
        validSources.forEach(source => {
          if (source.source === 'internal_database') {
            totalCompetitors += source.similarIdeas || 0;
            if (source.similarityScore) {
              totalSimilarity += source.similarityScore;
              similarityCount++;
            }
            confidence += 0.3;
          } else if (source.source === 'google') {
            totalCompetitors += source.competitorCount || 0;
            confidence += 0.7;
          }
        });
        
        const avgSimilarity = similarityCount > 0 ? totalSimilarity / similarityCount : 0;
        confidence = Math.min(confidence, 1.0);
        
        aggregatedScore = {
          totalCompetitors: Math.max(0, Math.floor(totalCompetitors)),
          avgSimilarity: Math.max(0, Math.min(1, avgSimilarity)),
          confidence: Math.max(0, Math.min(1, confidence)),
          sourcesCount: validSources.length
        };
      } else {
        // Validate existing aggregatedScore
        aggregatedScore = {
          totalCompetitors: Math.max(0, Math.floor(aggregatedScore.totalCompetitors || 0)),
          avgSimilarity: Math.max(0, Math.min(1, aggregatedScore.avgSimilarity || 0)),
          confidence: Math.max(0, Math.min(1, aggregatedScore.confidence || 0)),
          sourcesCount: Math.max(0, Math.floor(aggregatedScore.sourcesCount || validSources.length))
        };
      }
      
      // Validate status
      const validStatuses = ['verified', 'pending', 'unverified'];
      let status = validation.status;
      if (!validStatuses.includes(status)) {
        // Recalculate status based on aggregated score
        if (aggregatedScore.totalCompetitors === 0) {
          status = 'unverified';
        } else if (aggregatedScore.totalCompetitors > 0 && aggregatedScore.confidence > 0.5) {
          status = 'verified';
        } else {
          status = 'pending';
        }
      }
      
      return {
        sources: validSources,
        aggregatedScore,
        status,
        lastChecked: validation.lastChecked || validSources[0]?.lastChecked || null
      };
    }
    
    // Transform the data to match our component structure
    // Tags are already cleaned and formatted in the JSON, so we just validate them
    let ideas = data.ideas.map((idea, index) => {
      // Validate and normalize validation data first
      const validatedValidation = validateValidation(idea.validation);
      
      // Validate and normalize saturation data (using validation data for consistency)
      const validatedSaturation = validateSaturation(idea.saturation, validatedValidation);
      
      // Debug: Log first few ideas with saturation/validation
      if (index < 3) {
        console.log(`🔍 Idea ${index + 1}:`, {
          name: idea.name,
          hasSaturation: !!validatedSaturation,
          hasValidation: !!validatedValidation,
          saturation: validatedSaturation,
          validation: validatedValidation
        })
      }
      
      return {
      id: index + 1,
      name: idea.name,
      title: idea.name, // Keep title for compatibility
      description: idea.description,
      painPoints: (idea.painPoints || []).map(cleanPainPoint).filter(p => p.length > 0),
      // Tags are already cleaned in JSON, just validate they're strings
      tags: (idea.tags || []).filter(tag => 
        tag && typeof tag === 'string' && tag.length > 0 && !tag.match(/^[=\-_]{3,}$/)
      ),
      // Add validated saturation and validation data
      ...(validatedSaturation && { saturation: validatedSaturation }),
      ...(validatedValidation && { validation: validatedValidation }),
      ...(idea.category && { category: idea.category }),
      // Add metadata
      metadata: {
        totalIdeas: data.metadata.uniqueIdeas,
        generated: data.metadata.generated
      }
      }
    })
    
    // Debug: Check how many ideas have saturation/validation after transformation
    const withSaturation = ideas.filter(i => i.saturation && Object.keys(i.saturation).length > 0).length
    const withValidation = ideas.filter(i => i.validation && Object.keys(i.validation).length > 0).length
    
    // Validate data consistency
    let consistencyIssues = 0
    ideas.forEach(idea => {
      if (idea.saturation && idea.validation) {
        const satCount = idea.saturation.competitorCount
        const valCount = idea.validation.aggregatedScore?.totalCompetitors
        if (satCount !== valCount && satCount !== undefined && valCount !== undefined) {
          consistencyIssues++
        }
      }
    })
    
    console.log(`✅ After transformation: ${withSaturation} ideas with saturation, ${withValidation} ideas with validation out of ${ideas.length} total`)
    if (consistencyIssues > 0) {
      console.warn(`⚠️  Found ${consistencyIssues} consistency issues between saturation and validation data (auto-corrected)`)
    } else {
      console.log(`✅ All saturation and validation data is consistent`)
    }
    
    // Validate that tags are properly linked to ideas
    let totalTags = 0
    let ideasWithTags = 0
    const allTags = new Set()
    ideas.forEach(idea => {
      if (idea.tags && idea.tags.length > 0) {
        ideasWithTags++
        totalTags += idea.tags.length
        idea.tags.forEach(tag => allTags.add(tag))
      }
    })
    
    // Calculate stats from actual JSON data
    const stats = {
      totalIdeas: ideas.length,
      uniqueIdeas: data.metadata?.uniqueIdeas || ideas.length,
      uniqueTags: allTags.size,
      ideasWithTags: ideasWithTags,
      totalTags: totalTags,
      duplicatesRemoved: data.metadata?.duplicatesRemoved || 0
    }
    
    // Update metadata with calculated stats
    const updatedMetadata = {
      ...data.metadata,
      stats: stats
    }
    
    console.log(`✅ Transformed ${ideas.length} ideas for display`)
    console.log(`📊 Tag statistics: ${ideasWithTags} ideas have tags, ${totalTags} total tags`)
    console.log(`🏷️  Total unique tags: ${allTags.size}`)
    
    return {
      ideas,
      metadata: updatedMetadata,
      stats: stats
    }
  } catch (error) {
    console.error('❌ Error loading ideas from JSON:', error)
    console.error('Make sure combined_ideas.json is in the public/ directory')
    return {
      ideas: [],
      metadata: null,
      stats: null
    }
  }
}

// Get unique tags from all ideas
export function extractUniqueTags(ideas) {
  const tagSet = new Set()
  ideas.forEach(idea => {
    if (idea.tags && Array.isArray(idea.tags)) {
      idea.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return Array.from(tagSet).sort()
}

// Get top tags by frequency
export function getTopTags(ideas, limit = 20) {
  const tagCount = {}
  ideas.forEach(idea => {
    if (idea.tags && Array.isArray(idea.tags)) {
      idea.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1
      })
    }
  })
  
  return Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }))
}

