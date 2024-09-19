export const fetchRepositoryData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { error: `Sorry, temporarily failed to fetch list.` };
    }
    const data = await response.json();
    return { data };
  } catch (err) {
    return { error: err.message };
  }
};
