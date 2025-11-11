// Calculate saturation metrics
function calculateSaturation(aggregatedScore, sources) {
  const competitorCount = aggregatedScore.totalCompetitors || 0;
  
  // Determine saturation level
  let level = 'low';
  if (competitorCount >= 50) {
    level = 'high';
  } else if (competitorCount >= 10) {
    level = 'medium';
  }

  // Determine market type (red ocean vs blue ocean)
  let marketType = 'blue ocean';
  if (competitorCount >= 20) {
    marketType = 'red ocean';
  }

  // Estimate TAM (Total Addressable Market) based on competitor count
  let tam = 'Unknown';
  if (competitorCount > 0) {
    // Rough estimation: more competitors = larger market
    if (competitorCount >= 100) {
      tam = '$1B+';
    } else if (competitorCount >= 50) {
      tam = '$500M+';
    } else if (competitorCount >= 20) {
      tam = '$100M+';
    } else if (competitorCount >= 10) {
      tam = '$50M+';
    } else {
      tam = '$10M+';
    }
  }

  return {
    level: level,
    competitorCount: competitorCount,
    marketType: marketType,
    tam: tam,
    lastVerified: new Date().toISOString()
  };
}

// Calculate saturation from validation sources
function calculateFromSources(sources) {
  let totalCompetitors = 0;
  let maxCompetitors = 0;

  sources.forEach(source => {
    if (source.competitorCount) {
      totalCompetitors += source.competitorCount;
      maxCompetitors = Math.max(maxCompetitors, source.competitorCount);
    } else if (source.similarIdeas) {
      totalCompetitors += source.similarIdeas;
      maxCompetitors = Math.max(maxCompetitors, source.similarIdeas);
    }
  });

  // Use max competitors as primary metric (most accurate source)
  const competitorCount = maxCompetitors > 0 ? maxCompetitors : totalCompetitors;

  return calculateSaturation(
    { totalCompetitors: competitorCount },
    sources
  );
}

module.exports = {
  calculateSaturation,
  calculateFromSources
};

