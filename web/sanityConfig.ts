export default {
  sanity: {
    baseConfig: {
      projectId: import.meta.env.SANITY_PROJECT_ID,
      dataset: import.meta.env.SANITY_DATASET,
      apiVersion: '2025-07-28',
    },
  },
};