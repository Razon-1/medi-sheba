const getListData = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const fetchPaginatedList = async (fetchPage, { onFirstPage } = {}) => {
  const firstResponse = await fetchPage(1);
  const firstData = firstResponse.data ?? firstResponse;
  const firstItems = getListData(firstData);

  if (onFirstPage) {
    onFirstPage(firstItems, firstData);
  }

  if (!Array.isArray(firstData?.results)) {
    return firstItems;
  }

  const pageSize = firstItems.length || 1;
  const totalPages = typeof firstData.count === 'number'
    ? Math.ceil(firstData.count / pageSize)
    : 1;

  if (totalPages <= 1) {
    return firstItems;
  }

  const restResponses = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchPage(index + 2))
  );

  const restItems = restResponses.flatMap((response) => getListData(response.data ?? response));
  return [...firstItems, ...restItems];
};
