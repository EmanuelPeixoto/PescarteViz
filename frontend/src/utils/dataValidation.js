export const ensureValidCommunity = (community) => {
  if (!community) return null;
  
  return {
    ...community,
    pessoas: parseInt(community.pessoas) || 0,
    pescadores: parseInt(community.pescadores) || 0,
    familias: parseInt(community.familias) || 0
  };
};

export const calculateStatistics = (community) => {
  const validCommunity = ensureValidCommunity(community);
  if (!validCommunity) return null;
  
  const { pessoas, pescadores } = validCommunity;
  
  return {
    ...validCommunity,
    percentualPescadores: pessoas > 0 ? (pescadores / pessoas) * 100 : 0
  };
};